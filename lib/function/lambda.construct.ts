import { Duration, Tags } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Architecture, Runtime, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications'
import { Construct } from 'constructs'
import { BucketSet, DynamoTableSet, LambdaSet } from '../types'

export function createLambdas(
  scope: Construct,
  envName: string,
  lambdaDir: string,
  dynamoTables: DynamoTableSet,
  s3buckets: BucketSet,
  authTokenArn: string,
): LambdaSet {
  const defaultEnvVars = {}

  const envVarsForCustomer = {
    ...defaultEnvVars,
    CUSTOMER_TABLE: dynamoTables.customerTable.tableName,
  }

  const envVarsForOrder = {
    ...defaultEnvVars,
    ORDER_TABLE: dynamoTables.orderTable.tableName,
    CUSTOMER_TABLE: dynamoTables.customerTable.tableName,
  }

  const envVarsForItem = {
    ...defaultEnvVars,
    ITEM_ORDER_TABLE: dynamoTables.itemOrderTable.tableName,
    ORDER_TABLE: dynamoTables.orderTable.tableName,
    CUSTOMER_TABLE: dynamoTables.customerTable.tableName,
  }

  const envVarsForPricing = {
    LIST_PRICING_TABLE: dynamoTables.listPricingTable.tableName,
    MOLD_PRICES_BUCKET: s3buckets.moldPricesBucket.bucketName,
  }

  const authorizerLambda = createLambda(scope, envName, lambdaDir, '/auth/auth.lambda.ts', 'Auth', 'authorizer', {
    AUTHORIZER_TOKEN_ARN: authTokenArn,
  })

  const getCustomerLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/customers/get-customer.lambda.ts',
    'Customers',
    'getCustomer',
    envVarsForCustomer,
  )

  const searchCustomerLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/customers/search-customer.lambda.ts',
    'Customers',
    'searchCustomer',
    envVarsForCustomer,
  )

  const postCustomerLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/customers/post-customer.lambda.ts',
    'Customers',
    'postCustomer',
    envVarsForCustomer,
  )

  const getCustomerOrdersLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/orders/get-customer-orders.lambda.ts',
    'Orders',
    'getCustomerOrders',
    envVarsForOrder,
  )

  const postCustomerOrderLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/orders/post-customer-order.lambda.ts',
    'Orders',
    'postCustomerOrder',
    envVarsForOrder,
  )

  const getOrderLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/orders/get-order.lambda.ts',
    'Orders',
    'getOrder',
    envVarsForOrder,
  )

  const getOrderItemsLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/items/get-order-items.lambda.ts',
    'Items',
    'getOrderItems',
    envVarsForItem,
  )

  const postOrderItemLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/items/post-order-item.lambda.ts',
    'Items',
    'postOrderItem',
    { ...envVarsForItem, ...envVarsForPricing },
  )

  const getOrderItemLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/items/get-order-item.lambda.ts',
    'Items',
    'getOrderItem',
    envVarsForItem,
  )

  const moldPricesLoaderLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/pricing/load-mold-prices.lambda.ts',
    'Pricing',
    'moldPricesLoader',
    envVarsForPricing,
  )

  const getPricesLambda = createLambda(
    scope,
    envName,
    lambdaDir,
    '/pricing/get-prices.lambda.ts',
    'Pricing',
    'getPrices',
    envVarsForPricing,
  )

  const result = {
    authorizerLambda,
    getCustomerLambda,
    searchCustomerLambda,
    postCustomerLambda,
    getCustomerOrdersLambda,
    postCustomerOrderLambda,
    getOrderLambda,
    getOrderItemsLambda,
    postOrderItemLambda,
    getOrderItemLambda,
    moldPricesLoaderLambda,
    getPricesLambda,
  }

  // All lambdas need read access to customer table, except for the postCustomerLambda and the authorizerLambda
  setReadPermissionsForTables(
    Object.values(result).filter(l => ![postCustomerLambda, authorizerLambda].includes(l)),
    [dynamoTables.customerTable],
  )

  // PostCustomerLambda needs write access to customer table
  setWritePermissionsForTables([postCustomerLambda], [dynamoTables.customerTable])

  // All get order and item lambdas need read access to order table
  setReadPermissionsForTables(
    [getCustomerOrdersLambda, getOrderLambda, getOrderItemsLambda, getOrderItemLambda, postOrderItemLambda],
    [dynamoTables.orderTable],
  )

  // PostCustomerOrderLambda needs write access to order table
  setWritePermissionsForTables([postCustomerOrderLambda], [dynamoTables.orderTable])

  // Get item lambdas need read access to item order table
  setReadPermissionsForTables([getOrderItemsLambda, getOrderItemLambda], [dynamoTables.itemOrderTable])

  // Post item lambda needs write access to item order table
  setWritePermissionsForTables([postOrderItemLambda], [dynamoTables.itemOrderTable])

  // Post item and data loader lambdas need read access to pricing table
  setReadPermissionsForTables(
    [postOrderItemLambda, moldPricesLoaderLambda, getPricesLambda],
    [dynamoTables.listPricingTable],
  )

  // Data loader lambdas need write access to pricing table
  setWritePermissionsForTables([moldPricesLoaderLambda], [dynamoTables.listPricingTable])

  // Set bucket permissions
  // MoldPricesLoaderLambda needs read access to mold prices bucket
  s3buckets.moldPricesBucket.grantRead(moldPricesLoaderLambda)

  // Set triggers
  // MoldPricesLoaderLambda needs to be triggered by S3
  s3buckets.moldPricesBucket.addObjectCreatedNotification(new LambdaDestination(moldPricesLoaderLambda))

  return result
}

function createLambda(
  scope: Construct,
  envName: string,
  lambdaDir: string,
  path: string,
  tag: string,
  functionName: string,
  envVars: Record<string, string>,
): LambdaFunction {
  const lambda = new NodejsFunction(scope, `${envName}-${functionName}`, {
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
    functionName: `${envName}-${functionName}`,
    entry: `${lambdaDir}/${path}`,
    environment: envVars,
  })

  setFunctionTags(lambda, tag, envName)
  return lambda
}

function setFunctionTags(i: Construct, area: string, envName: string) {
  Tags.of(i).add('Environment', envName)
  Tags.of(i).add('Area', area)
}

function setReadPermissionsForTables(lambdas: LambdaFunction[], tables: Table[]) {
  lambdas.forEach(l => tables.forEach(t => t.grantReadData(l)))
}

function setWritePermissionsForTables(lambdas: LambdaFunction[], tables: Table[]) {
  lambdas.forEach(l => tables.forEach(t => t.grantWriteData(l)))
}
