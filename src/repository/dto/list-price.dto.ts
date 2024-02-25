import { PricingType } from '../../type/pricing.type'

export type ListPriceDto = {
  id: string
  price: number
  description: string
  type: PricingType
}
