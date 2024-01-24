import {
  PolicyDocument,
  APIGatewayTokenAuthorizerEvent,
  APIGatewayIAMAuthorizerResult,
  APIGatewayEvent,
} from 'aws-lambda'
import { verify, decode, JwtPayload } from 'jsonwebtoken'
import { JwksClient } from 'jwks-rsa'
import * as log from 'lambda-log'
import { env } from '../config/env'
import { User } from '../type/user.type'

const client = new JwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: env.jwksUri,
})

const jwtOptions = {
  audience: env.audience,
  issuer: env.tokenIssuer,
}

function getPolicyDocument(effect: string, resource: string): PolicyDocument {
  const policyDocument = {
    Version: '2012-10-17', // default version
    Statement: [
      {
        Action: 'execute-api:Invoke', // default action
        Effect: effect,
        Resource: resource,
      },
    ],
  }
  return policyDocument
}

function getToken(params: APIGatewayTokenAuthorizerEvent): string | undefined {
  if (!params.type || params.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"')
  }

  const tokenString = params.authorizationToken
  if (!tokenString) {
    throw new Error('Expected "event.authorizationToken" parameter to be set')
  }

  const match = tokenString.match(/^Bearer (.*)$/)
  if (!match || match.length < 2) {
    throw new Error(`Invalid Authorization token - ${tokenString} does not match "Bearer .*"`)
  }
  return match[1]
}

export async function authenticate(params: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayIAMAuthorizerResult> {
  try {
    const token = getToken(params)
    if (token === undefined) throw new Error('invalid token')
    log.info(`token: ${token}`)

    const decoded = decode(token, { complete: true })
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error('invalid token')
    }

    const signingKey = await client.getSigningKey(decoded.header.kid)
    const publicKey = signingKey.getPublicKey()
    const jwtp = verify(token, publicKey, jwtOptions) as JwtPayload
    return {
      principalId: jwtp.sub!!,
      policyDocument: getPolicyDocument('Allow', params.methodArn),
      context: { scope: jwtp['scope'] },
    }
  } catch (err: any) {
    log.error(`Error while verifying the jwt: ${err.toString()}`)
  }

  return {
    principalId: '$context.authorizer.principalId',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: params.methodArn,
        },
      ],
    },
  }
}

export function getUserFromEvent(event: APIGatewayEvent): User | null {
  const { authorizer } = event.requestContext
  if (!authorizer) return null
  const { context } = authorizer
  if (!context) return null
  if (!context.userId || !context.userName || !context.storeId) return null

  return {
    id: context.userId!!,
    name: context.userName!!,
    storeId: context.storeId!!,
  }
}
