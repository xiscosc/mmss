import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { getUserFromEvent } from '../../auth/auth.lib'
import { OrderService } from '../../service/order.service'
import { Order } from '../../type/api.type'
import { badRequest, internalServerError, isValidUuid, notFound, created, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = await getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })

  const customerId = event.pathParameters?.['customerId']
  if (!isValidUuid(customerId)) {
    return badRequest({ message: 'Invalid customerId' })
  }

  const orderData: Order = JSON.parse(event.body || '{}')
  // TODO: Validate order data when new fields are added
  if (false) {
    log.info(orderData as any)
    return badRequest({ message: 'Invalid order data' })
  }

  try {
    const orderService = new OrderService(user)
    const order = await orderService.createOrder(customerId!)
    if (order === null) return notFound({ message: `Customer ${customerId} not found` })
    return created(order)
  } catch (err: any) {
    log.error(`Error creating order with customer ${customerId}: ${err.toString()}`)
    return internalServerError({ message: `Error creating order with customer ${customerId}` })
  }
}
