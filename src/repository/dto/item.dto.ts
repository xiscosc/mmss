export type ItemDto = {
  itemUuid: string
  orderUuid: string
  moldingId: string
  width: number
  height: number
  passePartout: boolean
  passePartoutWidth?: number
  passePartoutHeight?: number
  glossyGlass: boolean
  mateGlass: boolean
  description: string
  observations: string
  quantity: number
  createdAt: number
}
