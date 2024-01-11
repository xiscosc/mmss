import { OrderDto } from './dto/order.dto'
import { DynamoRepository } from './dynamo.repository'
import { env } from '../config/env'
import { Order } from '../type/api.type'

export class OrderRepository extends DynamoRepository<OrderDto> {
  constructor() {
    super(env.orderTable, 'customerUuid', 'timestamp')
  }

  public async getOrderById(orderId: string): Promise<Order | null> {
    const dto = await this.getByUuid(orderId)
    if (dto) {
      return OrderRepository.fromDto(dto)
    }

    return null
  }

  public async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    const dtos = await this.getByPartitionKey(customerId)
    return dtos.map(OrderRepository.fromDto)
  }

  public async createOrder(order: Order) {
    if (!order.id || !order.customerId || !order.createdAt || !order.storeId) {
      throw new Error('Invalid order data')
    }

    await this.put(OrderRepository.toDto(order))
  }

  private static fromDto(dto: OrderDto): Order {
    return {
      id: dto.uuid,
      customerId: dto.customerUuid,
      createdAt: new Date(dto.timestamp).toISOString(),
      storeId: dto.storeId,
    }
  }

  private static toDto(order: Order): OrderDto {
    return {
      uuid: order.id!,
      customerUuid: order.customerId!,
      timestamp: Date.parse(order.createdAt!),
      storeId: order.storeId!,
    }
  }
}
