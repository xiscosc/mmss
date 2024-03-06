import { APIGatewayEvent, ProxyResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { PricingProvider } from '../../data/pricing.provider'
import { AuthService } from '../../service/auth.service'
import { PricingType } from '../../type/pricing.type'
import { badRequest, internalServerError, ok, unauthorized } from '../api.helper'

export async function handler(event: APIGatewayEvent): Promise<ProxyResult> {
  const user = AuthService.getUserFromEvent(event)
  if (!user) return unauthorized({ message: 'Unauthorized' })

  const priceTypeParam = event.queryStringParameters?.['priceType']
  let priceType: PricingType
  try {
    priceType = PricingType[priceTypeParam as keyof typeof PricingType]
  } catch (err) {
    return badRequest({ message: `Invalid priceType ${priceTypeParam}` })
  }

  if (!priceType) {
    return badRequest({ message: 'Invalid priceType' })
  }

  try {
    const pricingProvider = new PricingProvider()
    const prices = await pricingProvider.getPricingList(priceType)
    return ok({ count: prices.length, prices })
  } catch (err: any) {
    log.error(`Error getting prices for ${priceType}: ${err.toString()}`)
    return internalServerError({ message: `Error getting prices for ${priceType}` })
  }
}
