import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { OrderService } from '../../service/order.service'
import { badRequest, internalServerError, isValidUuid, notFound, ok, unauthorized } from '../api.helper'
import { AuthService } from '../../service/auth.service'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = AuthService.getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })

  const customerId = event.pathParameters?.['customerId']
  if (!isValidUuid(customerId)) {
    return badRequest({ message: 'Invalid Id' })
  }

  try {
    const orderService = new OrderService(user)
    const orders = await orderService.getOrdersByCustomerId(customerId!)
    if (orders === null) return notFound({ message: `Customer ${customerId} not found` })
    return ok({ count: orders.length, orders })
  } catch (err: any) {
    log.error(`Error getting orders for customer ${customerId}: ${err.toString()}`)
    return internalServerError({ message: `Error obtaining orders for customer ${customerId}` })
  }
}
