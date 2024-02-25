import { PricingType } from '../../type/pricing.type'

export type MatrixPriceDto = {
  dimension: string // e.g. 125x35, 3mm_125x35
  price: number
  type: PricingType
}
