import { MaxArea } from '../repository/dto/list-price.dto'

const moldMatrix: { [key: number]: number } = {
  25: 1.07,
  30: 1.18,
  35: 1.29,
  40: 1.44,
  45: 1.52,
  50: 1.67,
  55: 1.78,
  60: 1.89,
  65: 2.04,
  70: 2.12,
  75: 2.27,
  80: 2.38,
  85: 2.49,
  90: 2.64,
  95: 2.72,
  100: 2.87,
  105: 2.98,
  110: 3.09,
  115: 3.24,
  120: 3.32,
  125: 3.47,
  130: 3.58,
  135: 3.69,
  140: 3.84,
  145: 3.92,
  150: 4.07,
  155: 4.18,
  160: 4.29,
  165: 4.44,
  170: 4.52,
  175: 4.67,
  185: 4.78,
  190: 4.89,
  195: 5.04,
  200: 5.12,
  205: 5.27,
  210: 5.38,
  215: 5.49,
  220: 5.64,
  225: 5.72,
  230: 5.87,
  235: 5.98,
  240: 6.09,
  245: 6.24,
  250: 6.32,
  255: 6.47,
  260: 6.58,
  265: 6.69,
  270: 6.84,
  275: 6.92,
  280: 7.07,
  285: 7.18,
  290: 7.29,
  295: 7.44,
  300: 7.52,
  305: 7.67,
  310: 7.78,
  315: 7.89,
  320: 8.04,
  325: 8.12,
  330: 8.27,
  335: 8.38,
  340: 8.49,
  345: 8.64,
  350: 8.72,
  355: 8.87,
  360: 8.98,
  365: 9.09,
  370: 9.24,
  375: 9.32,
  380: 9.47,
  385: 9.58,
  390: 9.69,
  395: 9.84,
  400: 9.92,
  405: 10.07,
  410: 10.15,
  415: 10.28,
  420: 10.44,
  425: 10.58,
  430: 10.66,
  435: 10.66,
  440: 11.05,
  445: 11.27,
  450: 11.48,
  455: 11.56,
  460: 11.73,
  465: 11.85,
  470: 12.04,
  475: 12.28,
  480: 12.36,
  485: 12.55,
  490: 12.67,
  495: 12.82,
  500: 13.03,
  505: 13.16,
  510: 13.35,
  515: 13.44,
  520: 13.67,
  525: 13.82,
  530: 14.07,
  535: 14.26,
  540: 14.42,
  545: 14.63,
  550: 14.75,
  555: 14.96,
  560: 15.18,
  565: 15.36,
}

const defaultTax = 1.21

export function getMoldPrice(mPrice: number, d1: number, d2: number): number {
  const factor = moldMatrix[d1 + d2]
  if (factor != null) return Math.ceil(factor * mPrice * 100) / 100
  throw new Error('Mold factor not found')
}

export function getFabricPrice(d1: number, d2: number): number {
  const x = d1 + d2
  return Math.ceil((0.0308 * x + 1.95) * 10) / 10
}

export function formula1Pricing(m2Price: number, d1: number, d2: number): number {
  const x = (d1 / 100) * (d2 / 100) * m2Price * defaultTax * 5 + 2
  return Math.ceil(x * 10) / 10
}

export function formulaAreaPricing(areas: MaxArea[], d1: number, d2: number): number {
  if (areas.length === 0) {
    throw Error('Price not found')
  }

  const sortedAreas = sortByAreaAndPerimeter(areas)
  let index = 0
  while (index < sortedAreas.length) {
    const area = sortedAreas[index]!
    if (area.d1 >= d1 && area.d2 >= d2) return area.price
    index += 1
  }

  throw Error('Price not found')
}

function sortByAreaAndPerimeter(data: MaxArea[]): MaxArea[] {
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
