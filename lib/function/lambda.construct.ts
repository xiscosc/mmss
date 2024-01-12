import { Duration, Tags } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Architecture, Runtime, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'

const commonLambdaProps = {
  runtime: Runtime.NODEJS_20_X,
  architecture: Architecture.ARM_64,
  memorySize: 256,
  timeout: Duration.seconds(10),
  logRetention: RetentionDays.ONE_MONTH,
  bundling: {
    minify: true,
    sourceMap: true,
  },
}

function setFunctionTags(i: Construct, area: string, envName: string) {
  Tags.of(i).add('Environment', envName)
  Tags.of(i).add('Area', area)
}

export function createGetOrderLambda(
  scope: Construct,
  envName: string,
  orderTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-getOrder`, {
    ...commonLambdaProps,
    handler: 'handler',
    functionName: `${envName}-getOrder`,
    entry: `${lambdaDir}/orders/get-order.lambda.ts`,
    environment: {
      ORDER_TABLE: orderTable.tableName,
    },
  })

  orderTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Orders', envName)
  return lambda
}

export function createGetCustomerOrdersLambda(
  scope: Construct,
  envName: string,
  orderTable: Table,
  customerTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-getCustomerOrders`, {
    ...commonLambdaProps,
    handler: 'handler',
    functionName: `${envName}-getOrder`,
    entry: `${lambdaDir}/orders/get-customer-orders.lambda.ts`,
    environment: {
      ORDER_TABLE: orderTable.tableName,
      CUSTOMER_TABLE: customerTable.tableName,
    },
  })

  orderTable.grantReadData(lambda)
  customerTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Orders', envName)
  return lambda
}

export function createPostCustomerOrderLambda(
  scope: Construct,
  envName: string,
  orderTable: Table,
  customerTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-postCustomerOrder`, {
    ...commonLambdaProps,
    handler: 'handler',
    functionName: `${envName}-postOrder`,
    entry: `${lambdaDir}/orders/post-customer-order.lambda.ts`,
    environment: {
      ORDER_TABLE: orderTable.tableName,
      CUSTOMER_TABLE: customerTable.tableName,
    },
  })

  orderTable.grantWriteData(lambda)
  customerTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Orders', envName)
  return lambda
}

export function createPostCustomerLambda(
  scope: Construct,
  envName: string,
  customerTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-postCustomer`, {
    ...commonLambdaProps,
    handler: 'handler',
    functionName: `${envName}-postCustomer`,
    entry: `${lambdaDir}/customers/post-customer.lambda.ts`,
    environment: {
      CUSTOMER_TABLE: customerTable.tableName,
    },
  })

  customerTable.grantWriteData(lambda)
  setFunctionTags(lambda, 'Customers', envName)
  return lambda
}

export function createGetCustomerLambda(
  scope: Construct,
  envName: string,
  customerTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-getCustomer`, {
    ...commonLambdaProps,
    handler: 'handler',
    functionName: `${envName}-getCustomer`,
    entry: `${lambdaDir}/customers/get-customer.lambda.ts`,
    environment: {
      CUSTOMER_TABLE: customerTable.tableName,
    },
  })

  customerTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Customers', envName)
  return lambda
}

export function createSearchCustomerLambda(
  scope: Construct,
  envName: string,
  customerTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-searchCustomer`, {
    ...commonLambdaProps,
    handler: 'handler',
    functionName: `${envName}-searchCustomer`,
    entry: `${lambdaDir}/customers/search-customer.lambda.ts`,
    environment: {
      CUSTOMER_TABLE: customerTable.tableName,
    },
  })

  customerTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Customers', envName)
  return lambda
}
