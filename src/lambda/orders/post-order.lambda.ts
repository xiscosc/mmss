import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { CustomerService } from '../../service/customer.service'
import { OrderService } from '../../service/order.service'
import { Order } from '../../type/api.type'
import { User } from '../../type/user.type'
import { badRequest, internalServerError, isValidUuid, notFound, created } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
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
    const orderService = new OrderService({} as User)
    const customerService = new CustomerService({} as User)

    const customer = await customerService.getCustomerById(customerId!)
    if (customer === null) return notFound({ message: `Customer ${customerId} not found` })
    const order = await orderService.createOrder(customer)
    return created(order)
  } catch (err: any) {
    log.error(`Error creating order with customer ${customerId}: ${err.toString()}`)
    return internalServerError({ message: `Error creating order with customer ${customerId}` })
  }
}
