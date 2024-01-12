import { v4 as uuidv4 } from 'uuid'
import { CustomerService } from './customer.service'
import { OrderRepository } from '../repository/order.repository'
import { Order } from '../type/api.type'
import { User } from '../type/user.type'

export class OrderService {
  private readonly storeId: string
  private repository: OrderRepository

  constructor(user: User) {
    this.storeId = user.storeId
    this.repository = new OrderRepository()
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const order = await this.repository.getOrderById(orderId)
    if (order && order.storeId === this.storeId) {
      return order
    }

    return null
  }

  async getOrdersByCustomerId(customerService: CustomerService, customerId: string): Promise<Order[] | null> {
    const customer = await customerService.getCustomerById(customerId)
    if (customer === null) return null
    const orders = await this.repository.getOrdersByCustomerId(customerId)
    return orders.filter(order => order.storeId === this.storeId)
  }

  async createOrder(customerService: CustomerService, customerId: string): Promise<Order | null> {
    const customer = await customerService.getCustomerById(customerId)
    if (customer === null) return null
    const order = {
      id: uuidv4(),
      customerId,
      createdAt: new Date().toISOString(),
      storeId: this.storeId,
    }

    await this.repository.createOrder(order)
    return order
  }
}
