import { APIGatewayTokenAuthorizerEvent, APIGatewayIAMAuthorizerResult } from 'aws-lambda'
import * as log from 'lambda-log'

const lib = require('../auth/auth.lib')

export async function handler(event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayIAMAuthorizerResult> {
  try {
    const data = await lib.authenticate(event)
    return data
  } catch (err: any) {
    log.error(`Error while verifying the jwt: ${err.toString()}`)
    throw new Error(`Error while verifying the jwt: ${err.toString()}`)
  }
}
