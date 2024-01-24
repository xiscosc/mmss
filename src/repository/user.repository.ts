import { UserDto } from './dto/user.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'
import { User } from '../type/user.type'

export class UserRepository extends DynamoRepository<UserDto> {
  constructor() {
    super(env.userTable, 'userId', 'storeId')
  }

  public async getUserById(userId: string): Promise<User | null> {
    const dtos = await this.getByPartitionKey(userId)
    if (dtos.length > 0 && dtos[0]) {
      return UserRepository.fromDto(dtos[0])
    }

    return null
  }

  private static fromDto(dto: UserDto): User {
    return {
      id: dto.userId,
      storeId: dto.storeId,
      name: dto.name,
    }
  }
}
