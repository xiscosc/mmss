import { Attribute, AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export function createCustomerTable(scope: Construct, envName: string): Table {
  return createTable(
    scope,
    `${envName}-customer`,
    {
      name: 'storeId',
      type: AttributeType.STRING,
    },
    {
      name: 'phone',
      type: AttributeType.STRING,
    },
  )
}

export function createOrderTable(scope: Construct, envName: string): Table {
  return createTable(
    scope,
    `${envName}-order`,
    {
      name: 'customerId',
      type: AttributeType.STRING,
    },
    {
      name: 'timeStamp',
      type: AttributeType.NUMBER,
    },
  )
}

export function createItemOrderTable(scope: Construct, envName: string): Table {
  return createTable(
    scope,
    `${envName}-item-order`,
    {
      name: 'orderId',
      type: AttributeType.STRING,
    },
    {
      name: 'itemId',
      type: AttributeType.STRING,
    },
  )
}

function createTable(scope: Construct, tableName: string, partitionKey: Attribute, sortKey?: Attribute): Table {
  return new Table(scope, `${tableName}-table`, {
    tableName,
    partitionKey,
    sortKey,
    billingMode: BillingMode.PAY_PER_REQUEST,
  })
}
