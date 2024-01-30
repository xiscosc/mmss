import { v4 as uuidv4 } from 'uuid'
import { CustomerService } from './customer.service'
import { Service } from './service'
import { UserService } from './user.service'
import { OrderDto } from '../repository/dto/order.dto'
import { OrderRepository } from '../repository/order.repository'
import { Customer, Order, User } from '../type/api.type'

export class OrderService extends Service {
  private repository: OrderRepository
  private customerService: CustomerService
  private userService: UserService

  constructor(user: User, customerService?: CustomerService, userService?: UserService) {
    super(user)
    this.repository = new OrderRepository()
    this.customerService = customerService ?? new CustomerService(user)
    this.userService = userService ?? new UserService(user)

    this.verifyInjection(this.customerService)
    this.verifyInjection(this.userService)
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const orderDto = await this.repository.getOrderById(orderId)
    if (orderDto && orderDto.storeId === this.storeId) {
      const customerPromise = this.customerService.getCustomerById(orderDto.customerUuid)
      const userPromise = this.userService.getUserById(orderDto.userId)
      const [customer, user] = await Promise.all([customerPromise, userPromise])
      if (customer && user) {
        return OrderService.fromDto(orderDto, customer, user)
      }
    }

    return null
  }

  async getOrdersByCustomerId(customerId: string): Promise<Order[] | null> {
    const customer = await this.customerService.getCustomerById(customerId)
    if (customer === null) return null
    const orderDtos = await this.repository.getOrdersByCustomerId(customerId)
    const filteredOrderDtos = orderDtos.filter(dto => dto.storeId === this.storeId)
    if (filteredOrderDtos.length > 0) {
      const users = await this.userService.getUsersByIds(new Set(filteredOrderDtos.map(dto => dto.userId)))
      const orders = filteredOrderDtos.map(dto => OrderService.fromDto(dto, customer, users.get(dto.userId)!))
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return []
  }

  async createOrder(customerId: string, observations?: string): Promise<Order | null> {
    const customer = await this.customerService.getCustomerById(customerId)
    if (customer === null) return null
    const order = {
      id: uuidv4(),
      customer,
      createdAt: new Date().toISOString(),
      storeId: this.storeId,
      user: this.user,
      observations,
    }

    await this.repository.createOrder(OrderService.toDto(order))
    return order
  }

  private static fromDto(dto: OrderDto, customer: Customer, user: User): Order {
    return {
      id: dto.uuid,
      customer,
      createdAt: new Date(dto.timestamp).toISOString(),
      storeId: dto.storeId,
      user,
      observations: dto.observations,
    }
  }

  private static toDto(order: Order): OrderDto {
    return {
      uuid: order.id!,
      customerUuid: order.customer.id,
      timestamp: Date.parse(order.createdAt!),
      storeId: order.storeId!,
      userId: order.user.id,
      observations: order.observations,
    }
  }
}
