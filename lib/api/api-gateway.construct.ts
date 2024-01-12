import { EndpointType, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Function } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'

export type ApiLambdaProps = {
  postCustomerLambda: Function
  getCustomerLambda: Function
  searchCustomerLambda: Function
  postCustomerOrderLambda: Function
  getCustomerOrdersLambda: Function
  getOrderLambda: Function
}

export function createApiGateway(scope: Construct, envName: string, lambdaProps: ApiLambdaProps): RestApi {
  const api = new RestApi(scope, `${envName}-trackListApi`, {
    restApiName: `MSS API - ${envName}`,
    endpointConfiguration: {
      types: [EndpointType.REGIONAL],
    },
  })

  const v1Resource = api.root.addResource('v1')
  const customersResource = v1Resource.addResource('customers')
  const ordersResource = v1Resource.addResource('orders')
  const orderIdResource = ordersResource.addResource('{orderId}')
  const customerIdResource = customersResource.addResource('{customerId}')
  const customerSearchResource = customersResource.addResource('search')
  const customerOrdersResource = customerIdResource.addResource('orders')

  orderIdResource.addMethod('GET', new LambdaIntegration(lambdaProps.getOrderLambda))
  customersResource.addMethod('POST', new LambdaIntegration(lambdaProps.postCustomerLambda))
  customerSearchResource.addMethod('POST', new LambdaIntegration(lambdaProps.searchCustomerLambda))
  customerIdResource.addMethod('GET', new LambdaIntegration(lambdaProps.getCustomerLambda))
  customerOrdersResource.addMethod('GET', new LambdaIntegration(lambdaProps.getCustomerOrdersLambda))
  customerOrdersResource.addMethod('POST', new LambdaIntegration(lambdaProps.postCustomerOrderLambda))

  return api
}
