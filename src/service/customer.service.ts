import { getCustomerById } from '../repository/customer.repository'
import { Customer } from '../type/api.type'
import { User } from '../type/user.type'

class CustomerService {
  private readonly storeId: string

  constructor(private user: User) {
    this.storeId = user.storeId
  }

  public async getCustomerById(customerId: string): Promise<Customer | null> {
    const customer = await getCustomerById(customerId)
    if (customer && customer.storeId === this.storeId) {
      return customer
    }

    return null
  }
}
