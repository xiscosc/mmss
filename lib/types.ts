import { StackProps } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Function } from 'aws-cdk-lib/aws-lambda'
import { Bucket } from 'aws-cdk-lib/aws-s3'

export interface MssStackProps extends StackProps {
  envName: string
  audience: string
  tokenIssuer: string
  jwksUri: string
  allowedUploadOrigins: string[]
}

export type LambdaSet = {
  postCustomerLambda: Function
  getCustomerLambda: Function
  searchCustomerLambda: Function
  postCustomerOrderLambda: Function
  getCustomerOrdersLambda: Function
  getOrderLambda: Function
  getOrderItemsLambda: Function
  getOrderItemLambda: Function
  postOrderItemLambda: Function
  authorizerLambda: Function
  getPricesLambda: Function
  moldPricesLoaderLambda: Function
}

export type DynamoTableSet = {
  userTable: Table
  customerTable: Table
  orderTable: Table
  itemOrderTable: Table
  calculatedItemOrderTable: Table
  listPricingTable: Table
}

export type BucketSet = {
  moldPricesBucket: Bucket
}
