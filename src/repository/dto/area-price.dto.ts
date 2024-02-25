import { PricingType } from '../../type/pricing.type'

export type MaxArea = {
  d1: number
  d2: number
  price: number
}

export type AreaPriceDto = {
  id: string
  type: PricingType
  areas: MaxArea[]
}
