export type CalculatedItemDto = {
  itemUuid: string
  discount: number
  parts: CalculatedItemPartDto[],
  total: number
}

export type CalculatedItemPartDto = {
  price: number
  quantity: number
  description: string
  log?: string
}
