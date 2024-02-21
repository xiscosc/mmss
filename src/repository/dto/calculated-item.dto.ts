export type CalculatedItemDto = {
  itemUuid: string
  discount: number
  parts: CalculatedItemPartDto[]
}

export type CalculatedItemPartDto = {
  price: number
  quantity: number
  description: string
  log?: string
}
