import { v4 as uuidv4 } from 'uuid'
import { CustomerRepository } from '../repository/customer.repository'
import { Customer } from '../type/api.type'
import { User } from '../type/user.type'

export class CustomerService {
  private readonly storeId: string
  private repository: CustomerRepository

  constructor(user: User) {
    this.storeId = user.storeId
    this.repository = new CustomerRepository()
  }

  public async getCustomerById(customerId: string): Promise<Customer | null> {
    const customer = await this.repository.getCustomerById(customerId)
    if (customer && customer.storeId === this.storeId) {
      return customer
    }

    return null
  }

  public async getCustomerByPhone(phone: string): Promise<Customer | null> {
    return await this.repository.getCustomerByPhone(this.storeId, phone)
  }

  public async createCustomer(name: string, phone: string): Promise<Customer> {
    const customer = {
      id: uuidv4(),
      name,
      storeId: this.storeId,
      phone,
    }

    await this.repository.createCustomer(customer)
    return customer
  }
}
