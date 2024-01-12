import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { CustomerService } from '../../service/customer.service'
import { OrderService } from '../../service/order.service'
import { User } from '../../type/user.type'
import { badRequest, internalServerError, isValidUuid, notFound, ok } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const customerId = event.pathParameters?.['customerId']
  if (!isValidUuid(customerId)) {
    return badRequest({ message: 'Invalid Id' })
  }

  try {
    const customerService = new CustomerService({} as User)
    const orderService = new OrderService({} as User)
    const orders = await orderService.getOrdersByCustomerId(customerService, customerId!)
    if (orders === null) return notFound({ message: `Customer ${customerId} not found` })
    return ok({ count: orders.length, orders })
  } catch (err: any) {
    log.error(`Error getting orders for customer ${customerId}: ${err.toString()}`)
    return internalServerError({ message: `Error obtaining orders for customer ${customerId}` })
  }
}
