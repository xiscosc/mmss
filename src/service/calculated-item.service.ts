import { PricingProvider } from '../data/pricing.provider'
import { CalculatedItemRepository } from '../repository/calculated-item.repository'
import { CalculatedItemDto } from '../repository/dto/calculated-item.dto'
import { CalculatedItem, CalculatedItemPart, Item } from '../type/api.type'
import { PricingType } from '../type/pricing.type'

export class CalculatedItemService {
  private calculatedItemRepository: CalculatedItemRepository
  private pricingProvider: PricingProvider

  constructor() {
    this.calculatedItemRepository = new CalculatedItemRepository()
    this.pricingProvider = new PricingProvider()
  }

  public async getCalculatedItem(itemId: string): Promise<CalculatedItem | null> {
    const dto = await this.calculatedItemRepository.getCalculatedItemById(itemId)
    return dto ? CalculatedItemService.fromDto(dto) : null
  }

  public async createCalculatedItem(
    item: Item,
    discount: number,
    extraParts: CalculatedItemPart[],
  ): Promise<CalculatedItem> {
    const calculatedItem: CalculatedItem = {
      itemId: item.id,
      discount,
      parts: [],
      total: 0,
    }

    const workingHeight = CalculatedItemService.roundUpToNearestGreaterFiveOrTen(
      item.width + 2 * item.passePartoutWidth,
    )
    const workingWidth = CalculatedItemService.roundUpToNearestGreaterFiveOrTen(
      item.height + 2 * item.passePartoutHeight,
    )

    const partPromises = [this.getMoldingPart(item.moldingId, workingWidth, workingHeight)]

    if (item.glassId) {
      partPromises.push(this.getGlassPart(item.glassId, workingWidth, workingHeight))
    }

    if (item.isFabric) {
      partPromises.push(this.getFabricPart(workingWidth, workingHeight))
    } else {
      partPromises.push(this.getBackPart(workingWidth, workingHeight))
    }

    if (item.passePartoutId) {
      partPromises.push(this.getPPPart(item.passePartoutId, workingWidth, workingHeight))
    }

    const parts = await Promise.all(partPromises)
    calculatedItem.parts.push(...parts)
    calculatedItem.parts.push(...extraParts)

    calculatedItem.total = CalculatedItemService.getTotalPrice(calculatedItem)
    await this.calculatedItemRepository.createCalculatedItem(CalculatedItemService.toDto(calculatedItem))
    return calculatedItem
  }

  private static getTotalPrice(calculatedItem: CalculatedItem): number {
    const subtotal = calculatedItem.parts.reduce((total, part) => total + part.price * part.quantity, 0)
    return subtotal * (1 - calculatedItem.discount)
  }

  private static fromDto(dto: CalculatedItemDto): CalculatedItem {
    return {
      itemId: dto.itemUuid,
      discount: dto.discount,
      parts: dto.parts,
      total: dto.total,
    }
  }

  private static toDto(calculatedItem: CalculatedItem): CalculatedItemDto {
    return {
      itemUuid: calculatedItem.itemId,
      discount: calculatedItem.discount,
      parts: calculatedItem.parts,
      total: calculatedItem.total,
    }
  }

  private static roundUpToNearestGreaterFiveOrTen(value: number): number {
    if (value % 5 === 0) {
      return value
    }

    return Math.ceil(value / 5) * 5
  }

  private async getMoldingPart(moldingId: string, width: number, height: number): Promise<CalculatedItemPart> {
    const moldingPrice = await this.pricingProvider.getValueFromListById(PricingType.MOLD, moldingId)
    const moldingFactor = await this.pricingProvider.getValueFromMatrixByDimensions(PricingType.MOLD, width, height)
    return {
      price: moldingPrice * moldingFactor,
      quantity: 1,
      description: `Moldura ${moldingId} ${width}x${height}`,
    }
  }

  private async getGlassPart(glassId: string, width: number, height: number): Promise<CalculatedItemPart> {
    const glassPrice = await this.pricingProvider.getValueFromMatrixByDimensions(
      PricingType.GLASS,
      width,
      height,
      glassId,
    )
    return {
      price: glassPrice,
      quantity: 1,
      description: `Cristal ${glassId} ${width}x${height}`,
    }
  }

  private async getBackPart(width: number, height: number): Promise<CalculatedItemPart> {
    const backPrice = await this.pricingProvider.getValueFromMatrixByDimensions(PricingType.BACK, width, height)
    return {
      price: backPrice,
      quantity: 1,
      description: `Trasera ${width}x${height}`,
    }
  }

  private async getPPPart(ppId: string, width: number, height: number): Promise<CalculatedItemPart> {
    const ppPrice = await this.pricingProvider.getAreaValueFromList(PricingType.PP, ppId, height, width)

    return {
      price: ppPrice,
      quantity: 1,
      description: `Passepartout ${ppId} ${width}x${height}`,
    }
  }

  private async getFabricPart(width: number, height: number): Promise<CalculatedItemPart> {
    const fabricPrice = await this.pricingProvider.getValueFromMatrixByDimensions(PricingType.FABRIC, width, height)
    return {
      price: fabricPrice,
      quantity: 1,
      description: `Estirar tela ${width}x${height}`,
    }
  }
}
