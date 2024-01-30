import { CalculatedPrice, Item } from "../type/api.type";
import BigNumber from "bignumber.js";
import { Service } from "./service";


export class PricingService extends Service {

    public async calculatePrice(item: Item): Promise<CalculatedPrice> {
        let total = new BigNumber(0.0)
        const logs : string[] = []

        const width = new BigNumber(item.width)
        const height = new BigNumber(item.height)
        logs.push(`Art dimensions: ${width}x${height}`)
        const moldingPricePromise = this.getMoldIdPrice(item.moldingId)

        let pricingWidth: BigNumber
        let pricingHeight: BigNumber

        if (!item.passePartoutId) {
            // Case 1: No pp
            pricingWidth= PricingService.roundUpToNearestFive(width)
            pricingHeight = PricingService.roundUpToNearestFive(height)
            logs.push(`Working dimensions: ${width}x${height}`)
        } else {
            // Case 2: pp
            const ppWidth = new BigNumber(item.passePartoutWidth!)
            const ppHeight = new BigNumber(item.passePartoutHeight!)
            logs.push(`Working dimensions: ${width.plus(ppWidth.multipliedBy(2)).minus(1)}x${height.plus(ppHeight.multipliedBy(2)).minus(1)}`)
            pricingWidth = PricingService.roundUpToNearestFive(width.plus(ppWidth.multipliedBy(2)).minus(1))
            pricingHeight = PricingService.roundUpToNearestFive(height.plus(ppHeight.multipliedBy(2)).minus(1))
        } 

        logs.push(`Width x height for pricing: ${pricingWidth}x${pricingHeight}`)
        const priceFactorPromise = this.getPriceFactor(pricingWidth, pricingHeight)
        const [moldingPrice, priceFactor] = await Promise.all([moldingPricePromise, priceFactorPromise])
        const framePrice = moldingPrice.multipliedBy(priceFactor)
        logs.push(`Frame price: ${moldingPrice} x ${priceFactor} = ${framePrice}`)


        total = total.plus(framePrice.multipliedBy(item.quantity))

        return {
            total: total.toNumber(),
            logs
        }
    }


    private static roundUpToNearestFive(num: BigNumber): BigNumber {
        return num.dividedBy(5).decimalPlaces(0, BigNumber.ROUND_UP).multipliedBy(5);
    }

    private async getMoldIdPrice(moldId: string): Promise<BigNumber> {
        return new BigNumber(0.0)
    }

    private async getPriceFactor(width: BigNumber, height: BigNumber): Promise<BigNumber> {
        return new BigNumber(0.0)
    }
    
}