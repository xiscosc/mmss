import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { CustomerService } from '../../service/customer.service'
import { User } from '../../type/user.type'
import { badRequest, internalServerError, notFound, ok, stringIsValid } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const customerData = JSON.parse(event.body || '{}')
  if (!stringIsValid(customerData.phone)) {
    return badRequest({ message: 'Invalid customer data' })
  }

  try {
    const service = new CustomerService({} as User)
    const customer = await service.getCustomerByPhone(customerData.phone!)
    if (customer === null) return notFound({ message: `Customer ${customerData.phone} not found` })
    return ok(customer)
  } catch (err: any) {
    log.error(`Error getting customer ${customerData.phone}: ${err.toString()}`)
    return internalServerError({ message: `Error getting customer ${customerData.phone}` })
  }
}
