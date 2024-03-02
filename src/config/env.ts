export const env = {
  customerTable: process.env['CUSTOMER_TABLE'] ?? '',
  itemOrderTable: process.env['ITEM_ORDER_TABLE'] ?? '',
  calculatedItemOrderTable: process.env['CALCULATED_ITEM_ORDER_TABLE'] ?? '',
  orderTable: process.env['ORDER_TABLE'] ?? '',
  userTable: process.env['USER_TABLE'] ?? '',
  audience: process.env['AUDIENCE'] ?? '',
  tokenIssuer: process.env['TOKEN_ISSUER'] ?? '',
  jwksUri: process.env['JWKS_URI'] ?? '',
  listPricingTable: process.env['LIST_PRICING_TABLE'] ?? '',
  moldPricesBucket: process.env['MOLD_PRICES_BUCKET'] ?? '',
}
