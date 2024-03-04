import {
  SecretsManagerClient,
  GetSecretValueCommandInput,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import { APIGatewayEvent, APIGatewayTokenAuthorizerEvent } from 'aws-lambda'
import * as log from 'lambda-log'
import { env } from '../config/env'
import { User } from '../type/api.type'

export class AuthService {
  private token: string | undefined

  public async isValidEvent(event: APIGatewayTokenAuthorizerEvent): Promise<boolean> {
    const token = await this.getToken()
    return token === event.authorizationToken
  }

  public static getUserFromEvent(event: APIGatewayEvent): User | undefined {
    const header = event.headers['user']
    if (header == null) {
        log.error('User header not found')
        return undefined
    }
    const headerParts = header.split('@')
    if (headerParts.length !== 2) {
      log.error('Invalid user header')
      return undefined
    }

    const idParts = headerParts[0]!.split('_')

    if (idParts.length !== 2) {
        log.error('Invalid user header')
        return undefined
    }

    const [storeId, name] = idParts
    if (storeId == null || name == null) {
        log.error('Invalid user header')
        return undefined
    }

    return {
        id: `${storeId}_${name}`,
        storeId,
        name,
    }
  }

  public static generateUserFromId(id: string): User | undefined {
    const idParts = id.split('_')
    if (idParts.length !== 2) {
      log.error('Invalid user id')
      return undefined
    }

    const [storeId, name] = idParts

    if (storeId == null || name == null) {
      log.error('Invalid user header')
      return undefined
    }

    return {
      id,
      storeId,
      name,
    }
  }

  public static generateUsersFromIds(ids: Set<string>): Map<string, User> {
    const users = new Map<string, User>()
    Array.from(ids).forEach(id => {
      const user = AuthService.generateUserFromId(id)
      if (user) {
        users.set(id, user)
      }
    })
    return users
  }

  private async getToken(): Promise<string | undefined> {
    if (!this.token) {
      this.token = await AuthService.downloadToken()
    }
    return this.token
  }

  private static async downloadToken(): Promise<string | undefined> {
    const client = new SecretsManagerClient({})
    const input: GetSecretValueCommandInput = {
      SecretId: env.authorizerTokenArn,
    }

    const secretResult = await client.send(new GetSecretValueCommand(input))
    return secretResult.SecretString
  }
}
