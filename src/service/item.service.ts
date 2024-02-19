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
    glassId: string,
    description: string,
    observations: string,
    quantity: number,
    passePartoutId?: string,
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
      passePartoutId,
      passePartoutWidth,
      passePartoutHeight,
      glassId,
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

  private static verifyItem(item: Item) {
    // Method that check that all fields are not null and not undefined
    if (
      !item.id ||
      !item.orderId ||
      !item.moldingId ||
      !item.width ||
      !item.height ||
      !item.glassId ||
      !item.description ||
      !item.observations ||
      !item.quantity ||
      !item.createdAt
    ) {
      throw new InvalidDataError('Invalid item data')
    }

    if ((item.passePartoutId != null) && (item.passePartoutWidth == null || item.passePartoutHeight == null)) {
      throw new InvalidDataError('Invalid item data')
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
      glassId: item.glassId,
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
      passePartoutId: dto.passePartoutId,
      passePartoutWidth: dto.passePartoutWidth,
      passePartoutHeight: dto.passePartoutHeight,
      glassId: dto.glassId,
      description: dto.description,
      observations: dto.observations,
      quantity: dto.quantity,
      createdAt: new Date(dto.createdAt).toISOString(),
    }
  }
}
