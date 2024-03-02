import { S3Event } from 'aws-lambda'
import * as log from 'lambda-log'
import { MoldPriceLoader } from '../../data/mold-price.loader'

export async function handler(event: S3Event): Promise<void> {
  const key = event.Records[0]?.s3.object.key
  if (key == null) return

  try {
    const moldPriceLoader = new MoldPriceLoader()
    await moldPriceLoader.loadMoldPrices(key)
  } catch (err: any) {
    log.error(`Error loading mold prices from ${key}: ${err.toString()}`)
  }
}
