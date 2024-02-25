import { AreaPriceDto } from './dto/area-price.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'
import { PricingType } from '../type/pricing.type'

export class AreaPricingRepository extends DynamoRepository<AreaPriceDto> {
  constructor() {
    super(env.areaPricingTable, 'type', 'id')
  }

  public async getByTypeAndId(type: PricingType, id: string): Promise<AreaPriceDto | null> {
    const price = await this.get(type, id)
    return price
  }
}
