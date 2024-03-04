import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { InvalidDataError } from '../../error/invalid-data.error'
import { AuthService } from '../../service/auth.service';
import { CustomerService } from '../../service/customer.service'
import { Customer } from '../../type/api.type'
import { badRequest, internalServerError, created, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = AuthService.getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })

  const customerData: Customer = JSON.parse(event.body || '{}')

  try {
    const service = new CustomerService(user)
    const customer = await service.createCustomer(customerData.name!, customerData.phone!)
    return created(customer)
  } catch (err: any) {
    if (err instanceof InvalidDataError) {
      return badRequest({ message: err.message })
    }

    log.error(`Error creating customer: ${err.toString()}`)
    return internalServerError({ message: `Error creating customer` })
  }
}
