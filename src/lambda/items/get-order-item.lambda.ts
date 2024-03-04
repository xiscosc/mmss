import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { AuthService } from '../../service/auth.service'
import { ItemService } from '../../service/item.service'
import { badRequest, internalServerError, isValidUuid, notFound, ok, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = AuthService.getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })

  const orderId = event.pathParameters?.['orderId']
  const itemId = event.pathParameters?.['itemId']
  if (!isValidUuid(orderId)) return badRequest({ message: 'Invalid orderId' })
  if (!isValidUuid(itemId)) return badRequest({ message: 'Invalid itemId' })

  try {
    const itemService = new ItemService(user)
    const item = await itemService.getItemByOrderIdAndId(orderId!, itemId!)
    if (item === null) return notFound({ message: `ItemId ${itemId} not found` })
    return ok(item)
  } catch (err: any) {
    log.error(`Error getting item ${itemId} for order ${orderId}: ${err.toString()}`)
    return internalServerError({ message: `Error obtaining item ${itemId} for order ${orderId}` })
  }
}
