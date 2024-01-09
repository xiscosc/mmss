import { App } from 'aws-cdk-lib'
import { MssStack } from './mss.stack'

export class MssApp extends App {
  constructor() {
    super()

    const props = {
      envName: MssApp.getFromEnv('ENV_NAME'),
    }

    new MssStack(this, `${props.envName}-mss-stack`, props)
  }

  private static getFromEnv(key: string): string {
    if (process.env[key] !== undefined) {
      return process.env[key]!!
    }

    throw Error(`Undefined env ${key}`)
  }
}