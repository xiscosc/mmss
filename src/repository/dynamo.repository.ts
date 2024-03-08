import { AttributeValue, DynamoDBClient, KeysAndAttributes } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocument,
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  PutCommand,
  BatchGetCommandInput,
  BatchGetCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import * as log from 'lambda-log'
import _ from 'lodash'

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

    try {
      this.client = DynamoDBDocument.from(new DynamoDBClient({}), {
        marshallOptions: { removeUndefinedValues: true },
      })
    } catch (error: any) {
      this.logError('constructor', error)
      throw error
    }
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
      this.logError('getByUuid', error)
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
      this.logError('get', error)
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
      this.logError('getByPartitionKey', error)
      throw error
    }

    return []
  }

  protected async getByPartitionKeys(partitionKeyValues: string[]): Promise<T[]> {
    const requestItems: { [key: string]: KeysAndAttributes } = {}
    requestItems[this.table] = {
      Keys: partitionKeyValues.map(keyValue => ({ [this.partitionKey]: { S: keyValue } })),
    }

    const params: BatchGetCommandInput = {
      RequestItems: requestItems,
    }

    try {
      const command = new BatchGetCommand(params)
      const response = await this.client.send(command)
      if (response.Responses) {
        return response.Responses[this.table] as T[]
      }
    } catch (error: any) {
      this.logError('getByPartitionKeys', error)
      throw error
    }

    return []
  }

  protected async put(dto: T) {
    const input = {
      TableName: this.table,
      Item: dto as Record<string, AttributeValue>,
    }

    try {
      await this.client.send(new PutCommand(input))
    } catch (error: any) {
      this.logError('put', error)
      throw error
    }
  }

  protected async batchPut(dtoList: T[]) {
    const putRequests = dtoList.map(dto => ({
      PutRequest: {
        Item: dto as Record<string, AttributeValue>,
      },
    }))

    const chunkedRequests = _.chunk(putRequests, 25)
    const batchPromises = chunkedRequests.map(requests => this.batchWrite(requests))

    try {
      await Promise.all(batchPromises)
    } catch (error: any) {
      this.logError('batchPut', error)
      throw error
    }
  }

  protected async batchDelete(values: { partitionKey: string; sortKey?: string }[]) {
    const deleteRequests = values.map(value => {
      const key = {
        [this.partitionKey]: value.partitionKey,
      }

      if (this.sortKey && value.sortKey) {
        key[this.sortKey] = value.sortKey
      }

      return {
        DeleteRequest: {
          Key: key,
        },
      }
    })

    const chunkedRequests = _.chunk(deleteRequests, 25)
    const batchPromises = chunkedRequests.map(requests => this.batchWrite(requests))
    try {
      await Promise.all(batchPromises)
    } catch (error: any) {
      this.logError('batchDelete', error)
      throw error
    }
  }

  private async batchWrite(requests: any) {
    const params = {
      RequestItems: {
        [this.table]: requests,
      },
    }

    try {
      await this.client.send(new BatchWriteCommand(params))
    } catch (error: any) {
      this.logError('batchWrite', error)
      throw error
    }
  }

  private logError(functionName: string, error: any) {
    log.error(
      `Error repo ${this.table}, partitionKey ${this.partitionKey}, sortkey ${
        this.sortKey
      }, and function ${functionName}: ${error.toString()}`,
    )
  }
}
