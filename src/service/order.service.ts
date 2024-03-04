import { v4 as uuidv4 } from 'uuid'
import { AuthService } from './auth.service'
import { CustomerService } from './customer.service'
import { OrderDto } from '../repository/dto/order.dto'
import { OrderRepository } from '../repository/order.repository'
import { Customer, Order, User } from '../type/api.type'

export class OrderService {
  private readonly storeId: string
  private repository: OrderRepository
  private customerService: CustomerService
  private currentUser: User

  constructor(user: User, customerService?: CustomerService) {
    this.storeId = user.storeId
    this.repository = new OrderRepository()
    this.customerService = customerService ?? new CustomerService(user)
    this.currentUser = user
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const orderDto = await this.repository.getOrderById(orderId)
    if (orderDto && orderDto.storeId === this.storeId) {
      const user = AuthService.generateUserFromId(orderDto.userId)
      const customer = await this.customerService.getCustomerById(orderDto.customerUuid)
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
      const users = AuthService.generateUsersFromIds(new Set(filteredOrderDtos.map(dto => dto.userId)))
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
      user: this.currentUser,
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
