import { CustomerDto } from './dto/customer.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'
import { Customer } from '../type/api.type'

export class CustomerRepository extends DynamoRepository<CustomerDto> {
  constructor() {
    super(env.customerTable, 'storeId', 'phone')
  }

  public async getCustomerById(customerId: string): Promise<Customer | null> {
    const dto = await this.getByUuid(customerId)
    if (dto) {
      return CustomerRepository.fromDto(dto)
    }

    return null
  }

  public async getCustomerByPhone(storeId: string, phone: string): Promise<Customer | null> {
    const dto = await this.get(storeId, phone)
    if (dto) {
      return CustomerRepository.fromDto(dto)
    }

    return null
  }

  public async createCustomer(customer: Customer) {
    if (!customer.id || !customer.name || !customer.phone || !customer.storeId) {
      throw new Error('Invalid customer data')
    }

    await this.put(CustomerRepository.toDto(customer))
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
