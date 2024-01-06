import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface MssStackProps extends StackProps {
  envName: string
}

export class MssStack extends Stack {
  constructor(scope: Construct, id: string, props: MssStackProps) {
    super(scope, id + props.envName, props)
  }
}
