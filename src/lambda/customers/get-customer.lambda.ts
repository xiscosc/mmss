import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { AuthService } from '../../service/auth.service';
import { CustomerService } from '../../service/customer.service'
import { badRequest, internalServerError, notFound, ok, isValidUuid, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = AuthService.getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })

  const id = event.pathParameters?.['customerId']
  if (!isValidUuid(id)) {
    return badRequest({ message: 'Invalid Id' })
  }

  try {
    const service = new CustomerService(user)
    const customer = await service.getCustomerById(id!)
    if (customer === null) return notFound({ message: `Customer ${id} not found` })
    return ok(customer)
  } catch (err: any) {
    log.error(`Error getting customer ${id}: ${err.toString()}`)
    return internalServerError({ message: `Error getting customer ${id}` })
  }
}
