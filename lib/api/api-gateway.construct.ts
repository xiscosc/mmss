import {
  AuthorizationType,
  EndpointType,
  LambdaIntegration,
  Method,
  Resource,
  RestApi,
  TokenAuthorizer,
} from 'aws-cdk-lib/aws-apigateway'
import { Function } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import { LambdaSet } from '../types'

let authorizer: TokenAuthorizer

export function createApiGateway(scope: Construct, envName: string, lambdaSet: LambdaSet): RestApi {
  const api = new RestApi(scope, `${envName}-trackListApi`, {
    restApiName: `MMSS API - ${envName}`,
    endpointConfiguration: {
      types: [EndpointType.REGIONAL],
    },
  })

  authorizer = new TokenAuthorizer(scope, `${envName}-apiAuthorizer`, {
    handler: lambdaSet.authorizerLambda,
    identitySource: 'method.request.header.Authorization',
  })

  const v1Resource = api.root.addResource('v1')
  const customersResource = v1Resource.addResource('customers')
  const pricesResource = v1Resource.addResource('prices')
  const ordersResource = v1Resource.addResource('orders')
  const orderIdResource = ordersResource.addResource('{orderId}')
  const customerIdResource = customersResource.addResource('{customerId}')
  const customerSearchResource = customersResource.addResource('search')
  const customerOrdersResource = customerIdResource.addResource('orders')
  const itemsResource = orderIdResource.addResource('items')
  const itemIdResource = itemsResource.addResource('{itemId}')

  addMethod(orderIdResource, 'GET', lambdaSet.getOrderLambda)
  addMethod(customersResource, 'POST', lambdaSet.postCustomerLambda)
  addMethod(customerSearchResource, 'POST', lambdaSet.searchCustomerLambda)
  addMethod(customerIdResource, 'GET', lambdaSet.getCustomerLambda)
  addMethod(customerOrdersResource, 'GET', lambdaSet.getCustomerOrdersLambda)
  addMethod(customerOrdersResource, 'POST', lambdaSet.postCustomerOrderLambda)
  addMethod(itemsResource, 'GET', lambdaSet.getOrderItemsLambda)
  addMethod(itemsResource, 'POST', lambdaSet.postOrderItemLambda)
  addMethod(itemIdResource, 'GET', lambdaSet.getOrderItemLambda)
  addMethod(pricesResource, 'GET', lambdaSet.getPricesLambda)

  return api
}

function addMethod(resource: Resource, httpMethod: string, lambda: Function): Method {
  if (authorizer === undefined) {
    throw new Error('Authorizer not defined')
  }

  return resource.addMethod(httpMethod, new LambdaIntegration(lambda), {
    authorizationType: AuthorizationType.CUSTOM,
    authorizer,
  })
}
