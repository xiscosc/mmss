import { v4 as uuidv4 } from 'uuid'
import { OrderService } from './order.service'
import { InvalidDataError } from '../error/invalid-data.error'
import { ItemDto } from '../repository/dto/item.dto'
import { ItemRepository } from '../repository/item.repository'
import { Item, Order, User } from '../type/api.type'

export class ItemService {
  private itemRepository: ItemRepository
  private orderService: OrderService
  private readonly storeId: string

  constructor(user: User, orderService?: OrderService) {
    this.itemRepository = new ItemRepository()
    this.storeId = user.storeId
    this.orderService = orderService ?? new OrderService(user)
  }

  async getItemByOrderAndId(order: Order, itemId: string): Promise<Item | null> {
    const item = await this.getItemByOrderParams(itemId, undefined, order)
    return item
  }

  async getItemByOrderIdAndId(orderId: string, itemId: string): Promise<Item | null> {
    const item = await this.getItemByOrderParams(itemId, orderId)
    return item
  }

  async getItemsByOrder(order: Order): Promise<Item[] | null> {
    const items = await this.getItemsByOrderParams(undefined, order)
    return items
  }

  async getItemsByOrderId(orderId: string): Promise<Item[] | null> {
    const items = await this.getItemsByOrderParams(orderId)
    return items
  }

  async createItem(
    orderId: string,
    moldingId: string,
    width: number,
    height: number,
    passePartout: boolean,
    glossyGlass: boolean,
    mateGlass: boolean,
    description: string,
    observations: string,
    quantity: number,
    passePartoutWidth?: number,
    passePartoutHeight?: number,
  ): Promise<Item | null> {
    const verifierdOrder = await this.verifyOrder(orderId)
    if (!verifierdOrder) return null
    const item: Item = {
      id: uuidv4(),
      orderId,
      moldingId,
      width,
      height,
      passePartout,
      passePartoutWidth,
      passePartoutHeight,
      glossyGlass,
      mateGlass,
      description,
      observations,
      quantity,
      createdAt: new Date().toISOString(),
    }

    ItemService.verifyItem(item)
    await this.itemRepository.createItem(ItemService.toDto(item))
    return item
  }

  private async verifyOrder(orderId?: string, paramOrder?: Order): Promise<Order | null> {
    let order
    if (orderId && !paramOrder) {
      order = await this.orderService.getOrderById(orderId)
    } else if (paramOrder && !orderId) {
      order = paramOrder
    }

    return !order || order.storeId !== this.storeId ? null : order
  }

  private async getItemByOrderParams(itemId: string, orderId?: string, paramOrder?: Order): Promise<Item | null> {
    const order = await this.verifyOrder(orderId, paramOrder)
    if (!order) return null
    const item = await this.itemRepository.getItemById(order.id, itemId)
    return item ? ItemService.fromDto(item) : null
  }

  private async getItemsByOrderParams(orderId?: string, paramOrder?: Order): Promise<Item[] | null> {
    const order = await this.verifyOrder(orderId, paramOrder)
    if (!order) return null
    const items = await this.itemRepository.getItemsByOrderId(order.id)
    return items.map(dto => ItemService.fromDto(dto))
  }

  private static verifyItem(item: Item) {
    const paramVerification =
      !!item.id &&
      !!item.orderId &&
      !!item.moldingId &&
      !!item.width &&
      !!item.height &&
      item.passePartout !== undefined &&
      item.glossyGlass !== undefined &&
      item.mateGlass !== undefined &&
      !!item.description &&
      !!item.observations &&
      !!item.quantity &&
      !!item.createdAt

    if (!paramVerification) throw new InvalidDataError('Invalid item data')

    if (item.passePartout && (!item.passePartoutWidth || !item.passePartoutHeight)) {
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
      passePartout: item.passePartout,
      passePartoutWidth: item.passePartoutWidth,
      passePartoutHeight: item.passePartoutHeight,
      glossyGlass: item.glossyGlass,
      mateGlass: item.mateGlass,
      description: item.description,
      observations: item.observations,
      quantity: item.quantity,
      createdAt: Date.parse(item.createdAt),
    }
  }

  private static fromDto(dto: ItemDto): Item {
    return {
      id: dto.itemUuid,
      orderId: dto.orderUuid,
      moldingId: dto.moldingId,
      width: dto.width,
      height: dto.height,
      passePartout: dto.passePartout,
      passePartoutWidth: dto.passePartoutWidth,
      passePartoutHeight: dto.passePartoutHeight,
      glossyGlass: dto.glossyGlass,
      mateGlass: dto.mateGlass,
      description: dto.description,
      observations: dto.observations,
      quantity: dto.quantity,
      createdAt: new Date(dto.createdAt).toISOString(),
    }
  }
}
