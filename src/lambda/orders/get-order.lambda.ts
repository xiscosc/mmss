import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { getUserFromEvent } from '../../auth/auth.lib'
import { OrderService } from '../../service/order.service'
import { badRequest, internalServerError, isValidUuid, notFound, ok, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })
  const id = event.pathParameters?.['id']
  if (!isValidUuid(id)) {
    return badRequest({ message: 'Invalid Id' })
  }

  try {
    const service = new OrderService(user)
    const order = await service.getOrderById(id!)
    if (order === null) return notFound({ message: `Order ${id} not found` })
    return ok(order)
  } catch (err: any) {
    log.error(`Error getting order ${id}: ${err.toString()}`)
    return internalServerError({ message: `Error obtaining the order ${id}` })
  }
}
