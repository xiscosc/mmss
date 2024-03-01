import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import * as stream from 'stream'
import { read } from 'xlsx'

import { ListPriceDto } from '../repository/dto/list-price.dto'
import { ListPricingRepository } from '../repository/list-pricing.repository'
import { PricingFormula, PricingType } from '../type/pricing.type'

export class MoldPriceLoader {
  private repository: ListPricingRepository
  private s3Client: S3Client
  constructor() {
    this.repository = new ListPricingRepository()
    this.s3Client = new S3Client({})
  }

  public async loadMoldPrices(): Promise<void> {
    const currentPriceIds = (await this.repository.getAllPricesByType(PricingType.MOLD)).map(p => p.id)
    const newPrices = await this.getPricesFromExcel()
    await this.repository.batchStoreListPrices(Array.from(newPrices.values()))

    const toDeleteIds = currentPriceIds.filter(id => !newPrices.has(id))
    await this.repository.deleteListPrices(PricingType.MOLD, toDeleteIds)
  }

  private async getPricesFromExcel(): Promise<Map<string, ListPriceDto>> {
    const buffer = await this.getExcelFromS3()
    const file = read(buffer, { type: 'buffer' })
    const sheet = file.Sheets['TODAS']
    if (sheet == null) throw Error('Sheet not found')

    const end = sheet['!ref']!.split(':')[1]
    const maxrow = parseInt(end!.split(/([A-Z])/)[2]!, 10)

    let count = 2
    const prices = new Map<string, ListPriceDto>()
    while (count < maxrow) {
      const internalId = sheet[`A${count}`]
      const externalId = sheet[`B${count}`]
      const price = sheet[`H${count}`]

      if (internalId && externalId && price) {
        const id = `${internalId.v}_${externalId.v}`
        prices.set(id, {
          id,
          price: Math.ceil(price.v * 100) / 100,
          description: '',
          type: PricingType.MOLD,
          formula: PricingFormula.NONE,
          areas: [],
        })
      }
      count += 1
    }

    return prices
  }

  private async getExcelFromS3(): Promise<Buffer> {
    const params = {
      Bucket: 'your-bucket-name',
      Key: 'path/to/your/excel-file.xlsx',
    }

    try {
      const { Body } = await this.s3Client.send(new GetObjectCommand(params))
      if (Body instanceof stream.Readable) {
        const chunks: Uint8Array[] = []
        // eslint-disable-next-line no-restricted-syntax
        for await (const chunk of Body) {
          chunks.push(chunk)
        }
        return Buffer.concat(chunks)
      }

      throw new Error('Failed to retrieve file from S3.')
    } catch (error) {
      console.error('Error downloading file from S3:', error)
      throw error
    }
  }
}
