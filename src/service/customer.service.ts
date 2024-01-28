import { v4 as uuidv4 } from 'uuid'
import { InvalidDataError } from '../error/invalid-data.error'
import { CustomerRepository } from '../repository/customer.repository'
import { CustomerDto } from '../repository/dto/customer.dto'
import { Customer, User } from '../type/api.type'

export class CustomerService {
  private readonly storeId: string
  private repository: CustomerRepository

  constructor(user: User) {
    this.storeId = user.storeId
    this.repository = new CustomerRepository()
  }

  public async getCustomerById(customerId: string): Promise<Customer | null> {
    const customerDto = await this.repository.getCustomerById(customerId)
    if (customerDto && customerDto.storeId === this.storeId) {
      return CustomerService.fromDto(customerDto)
    }

    return null
  }

  public async getCustomerByPhone(phone: string): Promise<Customer | null> {
    const dto = await this.repository.getCustomerByPhone(this.storeId, phone)
    return dto ? CustomerService.fromDto(dto) : null
  }

  public async createCustomer(name: string, phone: string): Promise<Customer> {
    const customer = {
      id: uuidv4(),
      name,
      storeId: this.storeId,
      phone,
    }

    CustomerService.validate(customer)
    await this.repository.createCustomer(CustomerService.toDto(customer))
    return customer
  }

  private static validate(customer: Customer) {
    if (!customer.name || !customer.phone || customer.name === '' || customer.phone === '') {
      throw new InvalidDataError('Invalid name and/or phone')
    }

    // Validate phone format
    const phoneRegex = /^\+\d{1,3}\d{9,15}$/
    if (!phoneRegex.test(customer.phone)) {
      throw new InvalidDataError('Invalid phone format')
    }
  }

  private static fromDto(dto: CustomerDto): Customer {
    return {
      id: dto.uuid,
      name: dto.name,
      phone: dto.phone,
      storeId: dto.storeId,
    }
  }

  private static toDto(customer: Customer): CustomerDto {
    return {
      uuid: customer.id!,
      name: customer.name!,
      phone: customer.phone!,
      storeId: customer.storeId!,
    }
  }
}
