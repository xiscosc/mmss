import { User } from '../type/api.type'

export abstract class Service {
  protected readonly user: User
  protected readonly storeId: string

  constructor(user: User) {
    this.user = user
    this.storeId = user.storeId
  }

  protected verifyInjection(otherService: Service): void {
    if (this.user !== otherService.user) {
      throw new Error('Invalid user')
    }
  }
}
