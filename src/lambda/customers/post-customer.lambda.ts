import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { getUserFromEvent } from '../../auth/auth.lib'
import { CustomerService } from '../../service/customer.service'
import { Customer } from '../../type/api.type'
import { badRequest, internalServerError, stringIsValid, created, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })

  const customerData: Customer = JSON.parse(event.body || '{}')
  if (!stringIsValid(customerData.name) || !stringIsValid(customerData.phone)) {
    return badRequest({ message: 'Invalid customer data' })
  }

  try {
    const service = new CustomerService(user)
    const customer = await service.createCustomer(customerData.name!, customerData.phone!)
    return created(customer)
  } catch (err: any) {
    log.error(`Error creating customer: ${err.toString()}`)
    return internalServerError({ message: `Error creating customer` })
  }
}
