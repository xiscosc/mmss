import { components } from '../generated/mss.openapi'

export type Customer = components['schemas']['Customer']
export type Order = components['schemas']['Order']
export type Item = components['schemas']['Item']
export type PostItem = Item & { parts: CalculatedItemPart[], discount?: number}
export type CalculatedItem = components['schemas']['CalculatedItem']
export type CalculatedItemPart = components['schemas']['CalculatedItemPart']
export type User = components['schemas']['User']
export type ItemResponse = components['schemas']['ItemResponse']