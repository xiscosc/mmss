import { ListPriceDto } from './dto/list-price.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'
import { PricingType } from '../type/pricing.type'

export class ListPricingRepository extends DynamoRepository<ListPriceDto> {
  constructor() {
    super(env.listPricingTable, 'type', 'id')
  }

  public async getByTypeAndId(type: PricingType, id: string): Promise<ListPriceDto | null> {
    const price = await this.get(type, id)
    return price
  }
}
