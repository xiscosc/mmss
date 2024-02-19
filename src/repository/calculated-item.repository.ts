import { CalculatedItemDto } from './dto/calculated-item.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'

export class ItemRepository extends DynamoRepository<CalculatedItemDto> {
  constructor() {
    super(env.calculatedItemOrderTable, 'itemUuid')
  }

  public async getCalculatedItemById(itemUuid: string): Promise<CalculatedItemDto | null> {
    const dto = await this.get(itemUuid)
    return dto
  }

  public async createCalculatedItem(calculatedItem: CalculatedItemDto) {
    await this.put(calculatedItem)
  }
}
