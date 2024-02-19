import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { getUserFromEvent } from '../../auth/auth.lib'
import { InvalidDataError } from '../../error/invalid-data.error'
import { ItemService } from '../../service/item.service'
import { Item } from '../../type/api.type'
import { badRequest, internalServerError, isValidUuid, notFound, created, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = await getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })
  const orderId = event.pathParameters?.['orderId']
  if (!isValidUuid(orderId)) return badRequest({ message: 'Invalid orderId' })
  const itemData: Item = JSON.parse(event.body || '{}')

  try {
    const itemService = new ItemService(user)
    const item = await itemService.createItem(
      orderId!,
      itemData.moldingId,
      itemData.width,
      itemData.height,
      itemData.glassId,
      itemData.description,
      itemData.observations,
      itemData.quantity,
      itemData.passePartoutId,
      itemData.passePartoutWidth,
      itemData.passePartoutHeight,
    )
    if (item === null) return notFound({ message: `OrderId ${orderId} not found` })
    return created(item)
  } catch (err: any) {
    if (err instanceof InvalidDataError) {
      return badRequest({ message: err.message })
    }

    log.error(`Error creating item for order ${orderId}: ${err.toString()}`)
    return internalServerError({ message: `Error creating item for order ${orderId}` })
  }
}
