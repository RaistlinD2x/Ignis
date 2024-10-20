import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface EKSStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;  // Expect the VPC to be passed as a prop
}

export class EKSStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: cdk.App, id: string, props: EKSStackProps) {
    super(scope, id, props);

    // Create the basic EKS cluster in the provided VPC
    this.cluster = new eks.Cluster(this, 'MyEKSCluster', {
      vpc: props.vpc,  // Use the VPC from the NetworkStack
      version: eks.KubernetesVersion.V1_31,
      defaultCapacity: 2,  // Basic capacity for the cluster
    });
  }
}
