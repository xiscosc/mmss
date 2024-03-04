import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { AuthService } from '../../service/auth.service'
import { ItemService } from '../../service/item.service'
import { badRequest, internalServerError, isValidUuid, notFound, ok, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = AuthService.getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })
  const orderId = event.pathParameters?.['orderId']
  if (!isValidUuid(orderId)) return badRequest({ message: 'Invalid orderId' })

  try {
    const itemService = new ItemService(user)
    const items = await itemService.getItemsByOrderId(orderId!)
    if (items === null) return notFound({ message: `OrderId ${orderId} not found` })
    return ok({ count: items.length, items })
  } catch (err: any) {
    log.error(`Error getting items for order ${orderId}: ${err.toString()}`)
    return internalServerError({ message: `Error obtaining items for order ${orderId}` })
  }
}
