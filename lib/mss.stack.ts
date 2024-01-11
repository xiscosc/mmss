import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createCustomerTable, createItemOrderTable, createOrderTable } from './database/dynamo-db.construct'
import {
  createGetCustomerLambda,
  createGetOrderLambda,
  createPostCustomerLambda,
  createPostOrderLambda,
  createSearchCustomerLambda,
} from './function/lambda.construct'

interface MssStackProps extends StackProps {
  envName: string
}

const LAMBDA_DIR = `${__dirname}/../src/lambda/`

export class MssStack extends Stack {
  private readonly props: MssStackProps
  constructor(scope: Construct, id: string, props: MssStackProps) {
    super(scope, id, props)
    this.props = props

    // Create tables
    const customerTable = createCustomerTable(this, this.props.envName)
    const orderTable = createOrderTable(this, this.props.envName)
    createItemOrderTable(this, this.props.envName)

    // Create lambdas
    createGetOrderLambda(this, this.props.envName, orderTable, LAMBDA_DIR)
    createPostOrderLambda(this, this.props.envName, orderTable, customerTable, LAMBDA_DIR)
    createGetCustomerLambda(this, this.props.envName, customerTable, LAMBDA_DIR)
    createPostCustomerLambda(this, this.props.envName, customerTable, LAMBDA_DIR)
    createSearchCustomerLambda(this, this.props.envName, customerTable, LAMBDA_DIR)
  }
}
