export const env = {
  customerTable: process.env['CUSTOMER_TABLE'] ?? '',
  itemOrderTable: process.env['ITEM_ORDER_TABLE'] ?? '',
  calculatedItemOrderTable: process.env['CALCULATED_ITEM_ORDER_TABLE'] ?? '',
  orderTable: process.env['ORDER_TABLE'] ?? '',
  userTable: process.env['USER_TABLE'] ?? '',
  listPricingTable: process.env['LIST_PRICING_TABLE'] ?? '',
  moldPricesBucket: process.env['MOLD_PRICES_BUCKET'] ?? '',
  authorizerTokenArn: process.env['AUTHORIZER_TOKEN_ARN'] ?? '',
}
