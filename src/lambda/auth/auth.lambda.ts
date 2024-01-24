import { APIGatewayTokenAuthorizerEvent, APIGatewayIAMAuthorizerResult } from 'aws-lambda'
import * as log from 'lambda-log'
import { authenticate } from '../../auth/auth.lib'

export async function handler(event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayIAMAuthorizerResult> {
  try {
    const authorizerResult = await authenticate(event)
    return authorizerResult
  } catch (err: any) {
    log.error(`Error while verifying the jwt: ${err.toString()}`)
    throw new Error(`Error while verifying the jwt: ${err.toString()}`)
  }
}
