import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createApiGateway } from './api/api-gateway.construct'
import { createCustomerTable, createItemOrderTable, createOrderTable } from './database/dynamo-db.construct'
import {
  createGetCustomerLambda,
  createGetOrderLambda,
  createPostCustomerLambda,
  createPostCustomerOrderLambda,
  createSearchCustomerLambda,
  createGetCustomerOrdersLambda,
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
    const getOrderLambda = createGetOrderLambda(this, this.props.envName, orderTable, LAMBDA_DIR)
    const postCustomerOrderLambda = createPostCustomerOrderLambda(
      this,
      this.props.envName,
      orderTable,
      customerTable,
      LAMBDA_DIR,
    )
    const getCustomerOrdersLambda = createGetCustomerOrdersLambda(
      this,
      this.props.envName,
      orderTable,
      customerTable,
      LAMBDA_DIR,
    )
    const getCustomerLambda = createGetCustomerLambda(this, this.props.envName, customerTable, LAMBDA_DIR)
    const postCustomerLambda = createPostCustomerLambda(this, this.props.envName, customerTable, LAMBDA_DIR)
    const searchCustomerLambda = createSearchCustomerLambda(this, this.props.envName, customerTable, LAMBDA_DIR)

    // Create API Gateway
    const apiLambdaProps = {
      getOrderLambda,
      postCustomerOrderLambda,
      getCustomerOrdersLambda,
      getCustomerLambda,
      postCustomerLambda,
      searchCustomerLambda,
    }

    createApiGateway(this, this.props.envName, apiLambdaProps)
  }
}
