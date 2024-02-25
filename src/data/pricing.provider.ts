import { AreaPricingRepository } from '../repository/area-pricing.repository'
import { MaxArea } from '../repository/dto/area-price.dto'
import { ListPricingRepository } from '../repository/list-pricing.repository'
import { MatrixPricingRepository } from '../repository/matrix-pricing.repository'
import { PricingType } from '../type/pricing.type'

export class PricingProvider {
  private matrixPricingRepository: MatrixPricingRepository
  private listPricingRepository: ListPricingRepository
  private areaPricingRepository: AreaPricingRepository

  constructor() {
    this.matrixPricingRepository = new MatrixPricingRepository()
    this.listPricingRepository = new ListPricingRepository()
    this.areaPricingRepository = new AreaPricingRepository()
  }

  public async getValueFromMatrixByDimensions(
    pricingType: PricingType,
    d1: number,
    d2: number,
    id?: string,
  ): Promise<number> {
    const dimension = PricingProvider.getDimensionKey(d1, d2, id)
    const priceDto = await this.matrixPricingRepository.getByTypeAndDimension(pricingType, dimension)
    if (priceDto == null) {
      throw Error('Price not found')
    }

    return priceDto.price
  }

  public async getValueFromListById(pricingType: PricingType, id: string): Promise<number> {
    const priceDto = await this.listPricingRepository.getByTypeAndId(pricingType, id)
    if (priceDto == null) {
      throw Error('Price not found')
    }

    return priceDto.price
  }

  public async getAreaValueFromList(pricingType: PricingType, id: string, d1d: number, d2d: number): Promise<number> {
    const { d1, d2 } = PricingProvider.cleanAndOrder(d1d, d2d)
    const areaDto = await this.areaPricingRepository.getByTypeAndId(pricingType, id)
    if (areaDto == null || areaDto.areas.length === 0) {
      throw Error('Price not found')
    }

    const sortedAreas = PricingProvider.sortByAreaAndPerimeter(areaDto.areas)
    let index = 0
    while (index < sortedAreas.length) {
      const area = sortedAreas[index]!
      if (area.d1 >= d1 && area.d2 >= d2) return area.price
      index += 1
    }

    throw Error('Price not found')
  }

  private static getDimensionKey(height: number, width: number, id?: string): string {
    const { d1, d2 } = this.cleanAndOrder(height, width)
    const dimension = `${d1}x${d2}`
    if (id != null) {
      return `${id}_${dimension}`
    }

    return dimension
  }

  private static cleanAndOrder(d1d: number, d2d: number) {
    return { d1: Math.floor(Math.max(d1d, d2d)), d2: Math.floor(Math.min(d1d, d2d)) }
  }

  private static sortByAreaAndPerimeter(data: MaxArea[]): MaxArea[] {
    // Calculate area and perimeter for each MaxArea object
    const areaAndPerimeter = data.map(item => ({
      ...item,
      area: item.d1 * item.d2,
      perimeter: 2 * (item.d1 + item.d2),
    }))

    // Sort the array based on area and perimeter
    areaAndPerimeter.sort((a, b) => {
      if (a.area !== b.area) {
        return a.area - b.area // Sort by area
      }

      return a.perimeter - b.perimeter // If area is the same, sort by perimeter
    })

    // Return the sorted array
    return areaAndPerimeter
  }
}
