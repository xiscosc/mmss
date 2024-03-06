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
  if (!priceTypeParam) return badRequest({ message: 'Missing priceType parameter' })
  const priceTypeMap: { [key: string]: PricingType } = {
    mold: PricingType.MOLD,
    other: PricingType.OTHER,
    fabric: PricingType.FABRIC,
    glass: PricingType.GLASS,
    back: PricingType.BACK,
    pp: PricingType.PP,
  }

  const priceType = priceTypeMap[priceTypeParam]
  if (!priceType) return badRequest({ message: `Invalid priceType: ${priceTypeParam}` })

  try {
    const pricingProvider = new PricingProvider()
    const prices = await pricingProvider.getPricingList(priceType)
    return ok({ count: prices.length, prices })
  } catch (err: any) {
    log.error(`Error getting prices for ${priceType}: ${err.toString()}`)
    return internalServerError({ message: `Error getting prices for ${priceType}` })
  }
}
