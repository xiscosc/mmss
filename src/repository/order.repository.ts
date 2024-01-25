import { OrderDto } from './dto/order.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'

export class OrderRepository extends DynamoRepository<OrderDto> {
  constructor() {
    super(env.orderTable, 'customerUuid', 'timestamp')
  }

  public async getOrderById(orderId: string): Promise<OrderDto | null> {
    const dto = await this.getByUuid(orderId)
    if (dto) {
      return dto
    }

    return null
  }

  public async getOrdersByCustomerId(customerUuid: string): Promise<OrderDto[]> {
    const dtos = await this.getByPartitionKey(customerUuid)
    return dtos
  }

  public async createOrder(order: OrderDto) {
    if (!order.uuid || !order.customerUuid || !order.timestamp || !order.storeId) {
      throw new Error('Invalid order data')
    }

    await this.put(order)
  }
}
