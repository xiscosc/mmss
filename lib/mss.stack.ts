import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createApiGateway } from './api/api-gateway.construct'
import { createDynamoTables } from './database/dynamo-db.construct'
import { createLambdas } from './function/lambda.construct'
import { MssStackProps } from './types'

const LAMBDA_DIR = `${__dirname}/../src/lambda/`

export class MssStack extends Stack {
  private readonly props: MssStackProps
  constructor(scope: Construct, id: string, props: MssStackProps) {
    super(scope, id, props)
    this.props = props

    // Create tables
    const tables = createDynamoTables(this, this.props.envName)

    // Create lambdas
    const lambdas = createLambdas(
      this,
      this.props.envName,
      LAMBDA_DIR,
      tables,
      this.props.audience,
      this.props.tokenIssuer,
      this.props.jwksUri,
    )

    createApiGateway(this, this.props.envName, lambdas)
  }
}
