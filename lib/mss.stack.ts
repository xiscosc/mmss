import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createCustomerTable, createItemOrderTable, createOrderTable } from './database/dynamo-db.construct'

interface MssStackProps extends StackProps {
  envName: string
}

export class MssStack extends Stack {
  private readonly props: MssStackProps
  constructor(scope: Construct, id: string, props: MssStackProps) {
    super(scope, id, props)
    this.props = props

    // Create tables
    createCustomerTable(this, this.props.envName)
    createOrderTable(this, this.props.envName)
    createItemOrderTable(this, this.props.envName)
  }
}
