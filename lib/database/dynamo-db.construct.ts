import { Attribute, AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { DynamoTableSet } from '../types'

export function createDynamoTables(scope: Construct, envName: string): DynamoTableSet {
  return {
    customerTable: createCustomerTable(scope, envName),
    orderTable: createOrderTable(scope, envName),
    itemOrderTable: createItemOrderTable(scope, envName),
    calculatedItemOrderTable: createCalculatedItemOrderTable(scope, envName),
    listPricingTable: createListPricingTable(scope, envName),
  }
}

function createCustomerTable(scope: Construct, envName: string): Table {
  return addUuidGsi(
    createTable(
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
    ),
  )
}

function createOrderTable(scope: Construct, envName: string): Table {
  return addUuidGsi(
    createTable(
      scope,
      `${envName}-order`,
      {
        name: 'customerUuid',
        type: AttributeType.STRING,
      },
      {
        name: 'timestamp',
        type: AttributeType.NUMBER,
      },
    ),
  )
}

function createItemOrderTable(scope: Construct, envName: string): Table {
  return createTable(
    scope,
    `${envName}-item-order`,
    {
      name: 'orderUuid',
      type: AttributeType.STRING,
    },
    {
      name: 'itemUuid',
      type: AttributeType.STRING,
    },
  )
}

function createListPricingTable(scope: Construct, envName: string): Table {
  return createTable(
    scope,
    `${envName}-list-pricing`,
    {
      name: 'type',
      type: AttributeType.STRING,
    },
    {
      name: 'id',
      type: AttributeType.STRING,
    },
  )
}

function createCalculatedItemOrderTable(scope: Construct, envName: string): Table {
  return createTable(scope, `${envName}-calculated-item-order`, {
    name: 'itemUuid',
    type: AttributeType.STRING,
  })
}

function createTable(scope: Construct, tableName: string, partitionKey: Attribute, sortKey?: Attribute): Table {
  return new Table(scope, `${tableName}-table`, {
    tableName,
    partitionKey,
    sortKey,
    billingMode: BillingMode.PAY_PER_REQUEST,
  })
}

function addUuidGsi(table: Table): Table {
  table.addGlobalSecondaryIndex({
    indexName: `uuid`,
    partitionKey: {
      name: 'uuid',
      type: AttributeType.STRING,
    },
  })

  return table
}
