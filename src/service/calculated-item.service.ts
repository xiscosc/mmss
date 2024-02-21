import { PricingFile, PricingProvider } from "../data/pricing.provider"
import { CalculatedItemRepository } from "../repository/calculated-item.repository"
import { CalculatedItemDto } from "../repository/dto/calculated-item.dto"
import { CalculatedItem, CalculatedItemPart, Item } from "../type/api.type"

export class CalculatedItemService {
    private calculatedItemRepository: CalculatedItemRepository
    private pricingProvider: PricingProvider

  constructor() {
    this.calculatedItemRepository = new CalculatedItemRepository()
    this.pricingProvider = new PricingProvider()
  }

  public async getCalculatedItemById(itemUuid: string): Promise<CalculatedItem | null> {
    const dto = await this.calculatedItemRepository.getCalculatedItemById(itemUuid)
    return dto ? CalculatedItemService.fromDto(dto) : null
  }

  public async createCalculatedItem(item: Item, discount: number, extraParts: CalculatedItemPart[]): Promise<CalculatedItem> {
    const calculatedItem: CalculatedItem = {
      itemId: item.id,
      discount,
      parts: [],
    }

    const workingHeight = CalculatedItemService.roundUpToNearestGreaterFiveOrTen(item.width + 2 * item.passePartoutWidth)
    const workingWidth = CalculatedItemService.roundUpToNearestGreaterFiveOrTen(item.height + 2 * item.passePartoutHeight)

    const parts = (await Promise.all([
        this.getMoldingPart(item.moldingId, workingWidth, workingHeight),
        this.getGlassPart(item.glassId, workingWidth, workingHeight),
        this.getBackPart(workingWidth, workingHeight),
        // this.getPPPart(item.width, item.height, item.passePartoutId),
    ])).filter((part): part is CalculatedItemPart => part !== null)

    calculatedItem.parts.push(...parts)
    calculatedItem.parts.push(...extraParts)

    await this.calculatedItemRepository.createCalculatedItem(CalculatedItemService.toDto(calculatedItem))
    return calculatedItem
   }

   public static getTotalPrice(calculatedItem: CalculatedItem): number {
    const subtotal = calculatedItem.parts.reduce((total, part) => total + part.price * part.quantity, 0)
    return subtotal * (1 - calculatedItem.discount)
   }
    

  private static fromDto(dto: CalculatedItemDto): CalculatedItem {
    return {
      itemId: dto.itemUuid,
      discount: dto.discount,
      parts: dto.parts,
    }
  }

  private static toDto(calculatedItem: CalculatedItem): CalculatedItemDto {
    return {
      itemUuid: calculatedItem.itemId,
      discount: calculatedItem.discount,
      parts: calculatedItem.parts,
    }
  }

  private static roundUpToNearestGreaterFiveOrTen(value: number): number {
    if (value % 5 === 0) {
      return value
    }

    return Math.ceil(value / 5) * 5
  }

  private async getMoldingPart(moldingId: string, width: number, height: number): Promise<CalculatedItemPart> {
    const moldingPrice = await this.pricingProvider.getValueFromListById(PricingFile.MOLDS, moldingId)
    const moldingFactor = await this.pricingProvider.getValueFromMatrixByDimensions(PricingFile.MOLDS, width, height)
    return {
        price: moldingPrice * moldingFactor,
        quantity: 1,
        description: `Moldura ${moldingId} ${width}x${height}`,
    }
  }

  private async getGlassPart(glassId: string, width: number, height: number): Promise<CalculatedItemPart> {
    const glassPrice = await this.pricingProvider.getValueFromMatrixByDimensions(PricingFile.GLASS, width, height, glassId)
    return {
        price: glassPrice,
        quantity: 1,
        description: `Cristal ${glassId} ${width}x${height}`,
    }
  }

  private async getBackPart(width: number, height: number): Promise<CalculatedItemPart> {
    const backPrice = await this.pricingProvider.getValueFromMatrixByDimensions(PricingFile.BACK, width, height)
    return {
        price: backPrice,
        quantity: 1,
        description: `Trasera ${width}x${height}`,
    }
  }

//   private async getPPPart(width: number, height: number, ppId?: string): Promise<CalculatedItemPart | null> {
//     if (!ppId) return null
//     const ppPrice = 0
//     return {
//         price: ppPrice,
//         quantity: 1,
//         description: `Passepartout ${ppId} ${width}x${height}`,
//     }
//   }
}