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

  public async storeListPrice(price: ListPriceDto): Promise<void> {
    await this.put(price)
  }

  public async batchStoreListPrices(prices: ListPriceDto[]): Promise<void> {
    if (prices.length === 0) {
      return
    }
    
    await this.batchPut(prices)
  }

  public async getAllPricesByType(type: PricingType): Promise<ListPriceDto[]> {
    const prices = await this.getByPartitionKey(type)
    return prices
  }

  public async deleteListPrices(type: PricingType, ids: string[]): Promise<void> {
    const params = ids.map(id => ({ partitionKey: type, sortKey: id }))
    if (params.length > 0) {
      await this.batchDelete(params)
    }
  }

  public async deleteListPrice(type: PricingType, id: string): Promise<void> {
    await this.deleteListPrices(type, [id])
  }
}
