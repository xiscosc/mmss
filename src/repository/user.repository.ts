import { UserDto } from './dto/user.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'
import { User } from '../type/user.type'

export class UserRepository extends DynamoRepository<UserDto> {
  constructor() {
    super(env.userTable, 'userId', 'storeId')
  }

  public async getUserById(userId: string): Promise<User | null> {
    const dto = await this.get(userId)
    if (dto) {
      return UserRepository.fromDto(dto)
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
