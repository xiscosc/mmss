import { UserDto } from '../repository/dto/user.dto'
import { UserRepository } from '../repository/user.repository'
import { User } from '../type/api.type'

export class UserService {
  private repository: UserRepository

  constructor() {
    this.repository = new UserRepository()
  }

  public async getUserById(userId: string): Promise<User | null> {
    const userDto = await this.repository.getUserById(userId)
    return userDto ? UserService.fromDto(userDto) : null
  }

  public async getUsersByIds(userIds: Set<string>): Promise<Map<string, User>> {
    const result = new Map<string, User>()
    const userDtos = await this.repository.getUsersByIds(Array.from(userIds))
    userDtos.forEach(dto => result.set(dto.userId, UserService.fromDto(dto)))
    return result
  }

  private static fromDto(dto: UserDto): User {
    return {
      id: dto.userId,
      storeId: dto.storeId,
      name: dto.name,
    }
  }
}
