import { ItemDto } from './dto/item.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'

export class ItemRepository extends DynamoRepository<ItemDto> {
  constructor() {
    super(env.itemOrderTable, 'orderUuid', 'itemUuid')
  }

  public async getItemById(orderUuid: string, itemUuid: string): Promise<ItemDto | null> {
    const dto = await this.get(orderUuid, itemUuid)
    return dto
  }

  public async getItemsByOrderId(orderUuid: string): Promise<ItemDto[]> {
    const dtos = await this.getByPartitionKey(orderUuid)
    return dtos
  }

  public async createItem(item: ItemDto) {
    if (
      !item.itemUuid ||
      !item.orderUuid ||
      !item.moldingId ||
      !item.width ||
      !item.height ||
      item.glossyGlass === undefined ||
      item.mateGlass === undefined ||
      !item.description ||
      !item.observations ||
      !item.quantity ||
      !item.createdAt
    ) {
      throw new Error('Invalid item data')
    }

    if (item.passePartoutId && (!item.passePartoutWidth || !item.passePartoutHeight)) {
      throw new Error('Invalid passe partout data')
    }

    await this.put(item)
  }
}
