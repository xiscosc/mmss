import { v4 as uuidv4 } from 'uuid'
import { OrderService } from './order.service'
import { Service } from './service'
import { InvalidDataError } from '../error/invalid-data.error'
import { ItemDto } from '../repository/dto/item.dto'
import { ItemRepository } from '../repository/item.repository'
import { CalculatedPrice, Item, User } from '../type/api.type'
import { CalculatedPriceDto } from '../repository/dto/calculated-price.dto'

export class ItemService extends Service {
  private itemRepository: ItemRepository
  private orderService: OrderService

  constructor(user: User, orderService?: OrderService) {
    super(user)
    this.itemRepository = new ItemRepository()
    this.orderService = orderService ?? new OrderService(user)
    this.verifyInjection(this.orderService)
  }

  async getItemByOrderIdAndId(orderId: string, itemId: string): Promise<Item | null> {
    const order = await this.orderService.getOrderById(orderId)
    if (!order) return null
    const item = await this.itemRepository.getItemById(order.id, itemId)
    return item ? ItemService.fromDto(item) : null
  }

  async getItemsByOrderId(orderId: string): Promise<Item[] | null> {
    const order = await this.orderService.getOrderById(orderId)
    if (!order) return null
    const items = await this.itemRepository.getItemsByOrderId(order.id)
    return items.map(dto => ItemService.fromDto(dto))
  }

  async createItem(
    orderId: string,
    moldingId: string,
    width: number,
    height: number,
    glossyGlass: boolean,
    mateGlass: boolean,
    description: string,
    observations: string,
    quantity: number,
    passePartoutId?: string,
    passePartoutWidth?: number,
    passePartoutHeight?: number,
  ): Promise<Item | null> {
    const verifierdOrder = await this.orderService.getOrderById(orderId)
    if (!verifierdOrder) return null
    const item: Item = {
      id: uuidv4(),
      orderId,
      moldingId,
      width,
      height,
      passePartoutId,
      passePartoutWidth,
      passePartoutHeight,
      glossyGlass,
      mateGlass,
      description,
      observations,
      quantity,
      createdAt: new Date().toISOString(),
    }

    item.calculatedPrice = await this.calculateItemPrice(item)
    ItemService.verifyItem(item)
    await this.itemRepository.createItem(ItemService.toDto(item))
    return item
  }

  private async calculateItemPrice(item: Item): Promise<CalculatedPrice> {
    const logs: string[] = []
    total = 0.0


    
    return { total: +this.storeId, logs }
  }

  private static verifyItem(item: Item) {
    const paramVerification =
      !!item.id &&
      !!item.orderId &&
      !!item.moldingId &&
      !!item.width &&
      !!item.height &&
      item.glossyGlass !== undefined &&
      item.mateGlass !== undefined &&
      !!item.description &&
      !!item.observations &&
      !!item.quantity &&
      !!item.createdAt &&
      !!item.calculatedPrice

    if (!paramVerification) throw new InvalidDataError('Invalid item data')

    if (item.passePartoutId && (!item.passePartoutWidth || !item.passePartoutHeight)) {
      throw new InvalidDataError('Invalid passe partout data')
    }
  }

  private static toDto(item: Item): ItemDto {
    return {
      itemUuid: item.id,
      orderUuid: item.orderId,
      moldingId: item.moldingId,
      width: item.width,
      height: item.height,
      passePartoutId: item.passePartoutId,
      passePartoutWidth: item.passePartoutWidth,
      passePartoutHeight: item.passePartoutHeight,
      glossyGlass: item.glossyGlass,
      mateGlass: item.mateGlass,
      description: item.description,
      observations: item.observations,
      quantity: item.quantity,
      createdAt: Date.parse(item.createdAt),
      calculatedPrice: ItemService.calculatedPriceToDto(item.calculatedPrice!)
    }
  }

  private static fromDto(dto: ItemDto): Item {
    return {
      id: dto.itemUuid,
      orderId: dto.orderUuid,
      moldingId: dto.moldingId,
      width: dto.width,
      height: dto.height,
      passePartoutId: dto.passePartoutId,
      passePartoutWidth: dto.passePartoutWidth,
      passePartoutHeight: dto.passePartoutHeight,
      glossyGlass: dto.glossyGlass,
      mateGlass: dto.mateGlass,
      description: dto.description,
      observations: dto.observations,
      quantity: dto.quantity,
      createdAt: new Date(dto.createdAt).toISOString(),
      calculatedPrice: ItemService.calculatedPriceFromDto(dto.calculatedPrice)
    }
  }

  private static calculatedPriceToDto(calculatedPrice: CalculatedPrice): CalculatedPriceDto {
    return {
      total: calculatedPrice.total,
      logs: calculatedPrice.logs
    }
  }

  private static calculatedPriceFromDto(calculatedPrice: CalculatedPriceDto): CalculatedPrice {
    return {
      total: calculatedPrice.total,
      logs: calculatedPrice.logs
    }
  }
}
