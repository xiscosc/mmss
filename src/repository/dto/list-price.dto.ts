import { PricingFormula, PricingType } from '../../type/pricing.type'

export type MaxArea = {
  d1: number
  d2: number
  price: number
}

export type ListPriceDto = {
  id: string
  price: number
  description: string
  type: PricingType
  formula: PricingFormula
  areas: MaxArea[]
  maxD1?: number
  maxD2?: number
}
