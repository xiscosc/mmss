import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { OrderService } from '../../service/order.service'
import { User } from '../../type/user.type'
import { badRequest, internalServerError, isValidUuid, notFound, ok } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const id = event.pathParameters?.['id']
  if (!isValidUuid(id)) {
    return badRequest({ message: 'Invalid Id' })
  }

  try {
    const service = new OrderService({} as User)
    const order = await service.getOrderById(id!)
    if (order === null) return notFound({ message: `Order ${id} not found` })
    return ok(order)
  } catch (err: any) {
    log.error(`Error getting order ${id}: ${err.toString()}`)
    return internalServerError({ message: `Error obtaining the order ${id}` })
  }
}
