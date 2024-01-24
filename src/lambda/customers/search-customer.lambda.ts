import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { getUserFromEvent } from '../../auth/auth.lib'
import { CustomerService } from '../../service/customer.service'
import { badRequest, internalServerError, notFound, ok, stringIsValid, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = await getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })
  const customerData = JSON.parse(event.body || '{}')
  if (!stringIsValid(customerData.phone)) {
    return badRequest({ message: 'Invalid customer data' })
  }

  try {
    const service = new CustomerService(user)
    const customer = await service.getCustomerByPhone(customerData.phone!)
    if (customer === null) return notFound({ message: `Customer ${customerData.phone} not found` })
    return ok(customer)
  } catch (err: any) {
    log.error(`Error getting customer ${customerData.phone}: ${err.toString()}`)
    return internalServerError({ message: `Error getting customer ${customerData.phone}` })
  }
}
