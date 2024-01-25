import { UserDto } from './dto/user.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'

export class UserRepository extends DynamoRepository<UserDto> {
  constructor() {
    super(env.userTable, 'userId', 'storeId')
  }

  public async getUserById(userId: string): Promise<UserDto | null> {
    const dtos = await this.getByPartitionKey(userId)
    if (dtos.length === 1 && dtos[0]) {
      return dtos[0]
    }

    return null
  }

  public async getUsersByIds(userIds: string[]): Promise<UserDto[]> {
    const dtos = await this.getByPartitionKeys(userIds)
    return dtos
  }
}
