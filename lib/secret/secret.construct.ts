import { Function } from 'aws-cdk-lib/aws-lambda'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'

export function addSecretToLambda(
  scope: Construct,
  environment: string,
  secretArn: string,
  name: string,
  functions: Function[],
) {
  const secret = Secret.fromSecretCompleteArn(scope, `${environment}-${name}`, secretArn)
  functions.forEach((func) => secret.grantRead(func))
}
