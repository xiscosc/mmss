import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { AuthService } from '../../service/auth.service'
import { OrderService } from '../../service/order.service'
import { Order } from '../../type/api.type'
import { badRequest, internalServerError, isValidUuid, notFound, created, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = AuthService.getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })

  const customerId = event.pathParameters?.['customerId']
  if (!isValidUuid(customerId)) {
    return badRequest({ message: 'Invalid customerId' })
  }

  const orderData: Order = JSON.parse(event.body || '{}')

  try {
    const orderService = new OrderService(user)
    const order = await orderService.createOrder(customerId!, orderData.observations)
    if (order === null) return notFound({ message: `Customer ${customerId} not found` })
    return created(order)
  } catch (err: any) {
    log.error(`Error creating order with customer ${customerId}: ${err.toString()}`)
    return internalServerError({ message: `Error creating order with customer ${customerId}` })
  }
}
