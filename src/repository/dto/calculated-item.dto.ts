export type CalculatedItemDto = {
  itemUuid: string
  discount: number
  parts: {
    price: number
    quantity: number
    log: string
  }[]
}
