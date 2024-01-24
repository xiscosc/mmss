import { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument, DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import * as log from 'lambda-log'

export abstract class DynamoRepository<T> {
  protected readonly table: string
  protected readonly partitionKey: string
  protected readonly sortKey?: string
  protected client: DynamoDBDocumentClient

  protected constructor(tableName: string, partitionKeyName: string, sortKeyName?: string) {
    if (!tableName || !partitionKeyName) {
      throw new Error('Invalid table or partition key name')
    }

    this.table = tableName
    this.partitionKey = partitionKeyName
    this.sortKey = sortKeyName
    this.client = DynamoDBDocument.from(new DynamoDBClient({}), {
      marshallOptions: { removeUndefinedValues: true },
    })
  }

  protected async getByUuid(uuid: string): Promise<T | null> {
    const params = {
      TableName: this.table,
      IndexName: 'uuid',
      KeyConditionExpression: '#uuid = :uuid',
      ExpressionAttributeNames: {
        '#uuid': 'uuid',
      },
      ExpressionAttributeValues: {
        ':uuid': uuid,
      },
    }

    try {
      const command = new QueryCommand(params)
      const response = await this.client.send(command)
      if (response.Items && response.Items.length > 0) {
        return response.Items[0] as T
      }
    } catch (error: any) {
      log.error(error)
      throw error
    }

    return null
  }

  protected async get(partitionKeyValue: string, sortKeyValue?: string): Promise<T | null> {
    const key = {
      [this.partitionKey]: partitionKeyValue,
    }

    if (this.sortKey && !sortKeyValue) {
      throw Error("Sort key value can't be null")
    }

    if (this.sortKey && sortKeyValue) {
      key[this.sortKey] = sortKeyValue
    }

    const params = {
      TableName: this.table,
      Key: key,
    }

    try {
      const command = new GetCommand(params)
      const response = await this.client.send(command)
      if (response.Item) {
        return response.Item as T
      }
    } catch (error: any) {
      log.error(error)
      throw error
    }

    return null
  }

  protected async getByPartitionKey(partitionKeyValue: string): Promise<T[]> {
    const params = {
      TableName: this.table,
      KeyConditionExpression: '#pk = :pkv',
      ExpressionAttributeNames: {
        '#pk': this.partitionKey,
      },
      ExpressionAttributeValues: {
        ':pkv': partitionKeyValue,
      },
    }

    try {
      const command = new QueryCommand(params)
      const response = await this.client.send(command)
      if (response.Items) {
        return response.Items as T[]
      }
    } catch (error: any) {
      log.error(error)
      throw error
    }

    return []
  }

  protected async put(dto: T) {
    const input = {
      TableName: this.table,
      Item: dto as Record<string, AttributeValue>,
    }
    await this.client.send(new PutCommand(input))
  }
}
