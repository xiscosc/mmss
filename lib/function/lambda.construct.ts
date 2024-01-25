import { Duration, Tags } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Architecture, Runtime, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'
import { DynamoTableSet, LambdaSet } from '../types'

const commonLambdaProps = {
  runtime: Runtime.NODEJS_20_X,
  architecture: Architecture.ARM_64,
  memorySize: 256,
  handler: 'handler',
  timeout: Duration.seconds(10),
  logRetention: RetentionDays.ONE_MONTH,
  bundling: {
    minify: true,
    sourceMap: true,
  },
}

export function createLambdas(
  scope: Construct,
  envName: string,
  lambdaDir: string,
  dynamoTables: DynamoTableSet,
  audience: string,
  tokenIssuer: string,
  jwksUri: string,
): LambdaSet {
  return {
    postCustomerLambda: createPostCustomerLambda(
      scope,
      envName,
      dynamoTables.customerTable,
      dynamoTables.userTable,
      lambdaDir,
    ),
    getCustomerLambda: createGetCustomerLambda(
      scope,
      envName,
      dynamoTables.customerTable,
      dynamoTables.userTable,
      lambdaDir,
    ),
    searchCustomerLambda: createSearchCustomerLambda(
      scope,
      envName,
      dynamoTables.customerTable,
      dynamoTables.userTable,
      lambdaDir,
    ),
    postCustomerOrderLambda: createPostCustomerOrderLambda(
      scope,
      envName,
      dynamoTables.orderTable,
      dynamoTables.customerTable,
      dynamoTables.userTable,
      lambdaDir,
    ),
    getCustomerOrdersLambda: createGetCustomerOrdersLambda(
      scope,
      envName,
      dynamoTables.orderTable,
      dynamoTables.customerTable,
      dynamoTables.userTable,
      lambdaDir,
    ),
    getOrderLambda: createGetOrderLambda(scope, envName, dynamoTables.orderTable, dynamoTables.userTable, lambdaDir),
    authorizerLambda: createAuthorizerLambda(scope, envName, lambdaDir, audience, tokenIssuer, jwksUri),
  }
}

function createGetOrderLambda(
  scope: Construct,
  envName: string,
  orderTable: Table,
  userTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-getOrder`, {
    ...commonLambdaProps,
    functionName: `${envName}-getOrder`,
    entry: `${lambdaDir}/orders/get-order.lambda.ts`,
    environment: {
      ORDER_TABLE: orderTable.tableName,
      USER_TABLE: userTable.tableName,
    },
  })

  orderTable.grantReadData(lambda)
  userTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Orders', envName)
  return lambda
}

function createGetCustomerOrdersLambda(
  scope: Construct,
  envName: string,
  orderTable: Table,
  customerTable: Table,
  userTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-getCustomerOrders`, {
    ...commonLambdaProps,
    functionName: `${envName}-getCustomerOrders`,
    entry: `${lambdaDir}/orders/get-customer-orders.lambda.ts`,
    environment: {
      ORDER_TABLE: orderTable.tableName,
      CUSTOMER_TABLE: customerTable.tableName,
      USER_TABLE: userTable.tableName,
    },
  })

  orderTable.grantReadData(lambda)
  customerTable.grantReadData(lambda)
  userTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Orders', envName)
  return lambda
}

function createPostCustomerOrderLambda(
  scope: Construct,
  envName: string,
  orderTable: Table,
  customerTable: Table,
  userTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-postCustomerOrder`, {
    ...commonLambdaProps,
    functionName: `${envName}-postCustomerOrder`,
    entry: `${lambdaDir}/orders/post-customer-order.lambda.ts`,
    environment: {
      ORDER_TABLE: orderTable.tableName,
      CUSTOMER_TABLE: customerTable.tableName,
      USER_TABLE: userTable.tableName,
    },
  })

  orderTable.grantWriteData(lambda)
  customerTable.grantReadData(lambda)
  userTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Orders', envName)
  return lambda
}

function createPostCustomerLambda(
  scope: Construct,
  envName: string,
  customerTable: Table,
  userTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-postCustomer`, {
    ...commonLambdaProps,
    functionName: `${envName}-postCustomer`,
    entry: `${lambdaDir}/customers/post-customer.lambda.ts`,
    environment: {
      CUSTOMER_TABLE: customerTable.tableName,
      USER_TABLE: userTable.tableName,
    },
  })

  customerTable.grantWriteData(lambda)
  userTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Orders', envName)
  return lambda
}

function createGetCustomerLambda(
  scope: Construct,
  envName: string,
  customerTable: Table,
  userTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-getCustomer`, {
    ...commonLambdaProps,
    functionName: `${envName}-getCustomer`,
    entry: `${lambdaDir}/customers/get-customer.lambda.ts`,
    environment: {
      CUSTOMER_TABLE: customerTable.tableName,
      USER_TABLE: userTable.tableName,
    },
  })

  customerTable.grantReadData(lambda)
  userTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Customers', envName)
  return lambda
}

function createSearchCustomerLambda(
  scope: Construct,
  envName: string,
  customerTable: Table,
  userTable: Table,
  lambdaDir: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-searchCustomer`, {
    ...commonLambdaProps,
    functionName: `${envName}-searchCustomer`,
    entry: `${lambdaDir}/customers/search-customer.lambda.ts`,
    environment: {
      CUSTOMER_TABLE: customerTable.tableName,
      USER_TABLE: userTable.tableName,
    },
  })

  customerTable.grantReadData(lambda)
  userTable.grantReadData(lambda)
  setFunctionTags(lambda, 'Customers', envName)
  return lambda
}

function createAuthorizerLambda(
  scope: Construct,
  envName: string,
  lambdaDir: string,
  audience: string,
  tokenIssuer: string,
  jwksUri: string,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-authorizer`, {
    ...commonLambdaProps,
    functionName: `${envName}-authorizer`,
    entry: `${lambdaDir}/auth/auth.lambda.ts`,
    environment: {
      AUDIENCE: audience,
      TOKEN_ISSUER: tokenIssuer,
      JWKS_URI: jwksUri,
    },
  })

  setFunctionTags(lambda, 'Auth', envName)
  return lambda
}

function setFunctionTags(i: Construct, area: string, envName: string) {
  Tags.of(i).add('Environment', envName)
  Tags.of(i).add('Area', area)
}
