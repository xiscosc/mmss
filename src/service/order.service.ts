import { v4 as uuidv4 } from 'uuid'
import { OrderRepository } from '../repository/order.repository'
import { Customer, Order } from '../type/api.type'
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

  async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    const orders = await this.repository.getOrdersByCustomerId(customerId)
    return orders.filter(order => order.storeId === this.storeId)
  }

  async createOrder(customer: Customer) {
    if (!customer.id || customer.storeId !== this.storeId) {
      throw new Error('Invalid customer data')
    }

    const order = {
      id: uuidv4(),
      customerId: customer.id,
      createdAt: new Date().toISOString(),
      storeId: this.storeId,
    }

    await this.repository.createOrder(order)
  }
}
