import { v4 as uuidv4 } from 'uuid'
import { CalculatedItemService } from './calculated-item.service'
import { OrderService } from './order.service'
import { InvalidDataError } from '../error/invalid-data.error'
import { ItemDto } from '../repository/dto/item.dto'
import { ItemRepository } from '../repository/item.repository'
import { CalculatedItem, CalculatedItemPart, Item, ItemResponse, Order, User } from '../type/api.type'

export class ItemService {
  private itemRepository: ItemRepository
  private orderService: OrderService
  private calculatedItemService: CalculatedItemService
  private readonly storeId: string

  constructor(user: User, orderService?: OrderService) {
    this.itemRepository = new ItemRepository()
    this.storeId = user.storeId
    this.orderService = orderService ?? new OrderService(user)
    this.calculatedItemService = new CalculatedItemService()
  }

  async getItemByOrderIdAndId(orderId: string, itemId: string): Promise<ItemResponse | null> {
    const order = await this.orderService.getOrderById(orderId)
    if (!order) return null
    const itemDto = await this.itemRepository.getItemById(order.id, itemId)
    if (itemDto == null) {
      return null
    }

    const item = ItemService.fromDto(itemDto)
    const calculatedItem = await this.calculatedItemService.getCalculatedItem(item.id)
    if (calculatedItem == null) return null
    return { item, calculatedItem }
  }

  async getItemsByOrderId(orderId: string): Promise<ItemResponse[] | null> {
    const order = await this.orderService.getOrderById(orderId)
    if (!order) return null
    const itemDtos = await this.itemRepository.getItemsByOrderId(order.id)
    const itemMap = new Map<string, Item>()
    itemDtos.forEach(dto => itemMap.set(dto.itemUuid, ItemService.fromDto(dto)))
    const itemIds = Array.from(itemMap.keys())
    const calculatedItems = await Promise.all(itemIds.map(id => this.calculatedItemService.getCalculatedItem(id)))
    const calculatedItemMap = new Map<string, CalculatedItem>()
    calculatedItems.forEach(ci => {
      if (ci != null) calculatedItemMap.set(ci.itemId, ci)
    })

    return Array.from(calculatedItemMap.keys()).map(id => ({
      item: itemMap.get(id)!,
      calculatedItem: calculatedItemMap.get(id)!,
    }))
  }

  async createItem(
    orderId: string,
    moldingId: string,
    width: number,
    height: number,
    description: string,
    observations: string,
    quantity: number,
    passePartoutWidth: number,
    passePartoutHeight: number,
    extraParts: CalculatedItemPart[],
    discount: number,
    isFabric = false,
    passePartoutId?: string,
    glassId?: string,
  ): Promise<ItemResponse | null> {
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
      isFabric,
    }

    ItemService.verifyItem(item)
    await this.itemRepository.createItem(ItemService.toDto(item))
    const calculatedItem = await this.calculatedItemService.createCalculatedItem(item, discount, extraParts)
    return { item, calculatedItem }
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
      !item.description ||
      !item.observations ||
      !item.quantity ||
      !item.createdAt
    ) {
      throw new InvalidDataError('Invalid item data')
    }

    if (item.passePartoutId != null && (item.passePartoutWidth == null || item.passePartoutHeight == null)) {
      throw new InvalidDataError('Invalid pp item data')
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
      isFabric: item.isFabric ?? false,
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
      isFabric: dto.isFabric,
    }
  }
}
