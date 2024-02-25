import { MatrixPriceDto } from './dto/matrix-price.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'
import { PricingType } from '../type/pricing.type'

export class MatrixPricingRepository extends DynamoRepository<MatrixPriceDto> {
  constructor() {
    super(env.matrixPricingTable, 'type', 'dimension')
  }

  public async getByTypeAndDimension(type: PricingType, dimension: string): Promise<MatrixPriceDto | null> {
    const price = await this.get(type, dimension)
    return price
  }
}
