import { Duration } from 'aws-cdk-lib'
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

export type ApiLambdaProps = {
  postCustomerLambda: Function
  getCustomerLambda: Function
  searchCustomerLambda: Function
  postCustomerOrderLambda: Function
  getCustomerOrdersLambda: Function
  getOrderLambda: Function
  authorizerLambda: Function
}

let authorizer: TokenAuthorizer

export function createApiGateway(scope: Construct, envName: string, lambdaProps: ApiLambdaProps): RestApi {
  const api = new RestApi(scope, `${envName}-trackListApi`, {
    restApiName: `MSS API - ${envName}`,
    endpointConfiguration: {
      types: [EndpointType.REGIONAL],
    },
  })

  authorizer = new TokenAuthorizer(scope, `${envName}-apiAuthorizer`, {
    handler: lambdaProps.authorizerLambda,
    identitySource: 'method.request.header.Authorization',
    resultsCacheTtl: Duration.minutes(60),
    // eslint-disable-next-line no-useless-escape
    validationRegex: `^Bearer [-0-9a-zA-z\.]*$`,
  })

  const v1Resource = api.root.addResource('v1')
  const customersResource = v1Resource.addResource('customers')
  const ordersResource = v1Resource.addResource('orders')
  const orderIdResource = ordersResource.addResource('{orderId}')
  const customerIdResource = customersResource.addResource('{customerId}')
  const customerSearchResource = customersResource.addResource('search')
  const customerOrdersResource = customerIdResource.addResource('orders')

  addMethod(orderIdResource, 'GET', lambdaProps.getOrderLambda)
  addMethod(customersResource, 'POST', lambdaProps.postCustomerLambda)
  addMethod(customerSearchResource, 'POST', lambdaProps.searchCustomerLambda)
  addMethod(customerIdResource, 'GET', lambdaProps.getCustomerLambda)
  addMethod(customerOrdersResource, 'GET', lambdaProps.getCustomerOrdersLambda)
  addMethod(customerOrdersResource, 'POST', lambdaProps.postCustomerOrderLambda)

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
