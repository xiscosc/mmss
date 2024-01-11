import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { CustomerService } from '../../service/customer.service'
import { User } from '../../type/user.type'
import { badRequest, internalServerError, notFound, ok, isValidUuid } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const id = event.pathParameters?.['id']
  if (!isValidUuid(id)) {
    return badRequest({ message: 'Invalid Id' })
  }

  try {
    const service = new CustomerService({} as User)
    const customer = await service.getCustomerById(id!)
    if (customer === null) return notFound({ message: `Customer ${id} not found` })
    return ok(customer)
  } catch (err: any) {
    log.error(`Error getting customer ${id}: ${err.toString()}`)
    return internalServerError({ message: `Error getting customer ${id}` })
  }
}
