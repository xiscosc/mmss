import { StackProps } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Function } from 'aws-cdk-lib/aws-lambda'

export interface MssStackProps extends StackProps {
  envName: string
  audience: string
  tokenIssuer: string
  jwksUri: string
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
}

export type DynamoTableSet = {
  userTable: Table
  customerTable: Table
  orderTable: Table
  itemOrderTable: Table
  calculatedItemOrderTable: Table
  matrixPricingTable: Table
  listPricingTable: Table
  areaPricingTable: Table
}
