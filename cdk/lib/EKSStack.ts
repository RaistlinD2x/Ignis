import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr'
import path = require('path');

interface EKSStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;  // Expect the VPC to be passed as a prop
    clusterStage: string // Pass in the env name
    ecrRepo: ecr.Repository
}

export class EKSStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: cdk.App, id: string, props: EKSStackProps) {
    super(scope, id, props);

    // Create the basic EKS cluster in the provided VPC
    this.cluster = new eks.Cluster(this, `MyEKSCluster-${props.clusterStage}`, {
      vpc: props.vpc,  // Use the VPC from the NetworkStack
      version: eks.KubernetesVersion.V1_31,
      defaultCapacity: 0,  // Basic capacity for the cluster
      clusterName: `MyEKSCluster-${props.clusterStage}`,
    });

    // Add a managed node group with specified instance types
    const autoScalingGroup = this.cluster.addAutoScalingGroupCapacity('NodeGroup', {
      instanceType: new ec2.InstanceType('t3a.micro'),  // Set the instance type
      minCapacity: 1,  // Minimum number of instances
      maxCapacity: 1,  // Maximum number of instances
    });

    // Attach the ASG to the cluster as self-managed node group
    this.cluster.connectAutoScalingGroupCapacity(autoScalingGroup, {
      mapRole: true,  // Maps the EC2 instance role to Kubernetes
    });

    // Deploy Helm chart for the frontend using the ECR repository URL
    this.cluster.addHelmChart('FrontendChart', {
      chart: path.join(__dirname, '../helm/frontend-chart'),
      release: 'frontend-release',
      values: {
        image: {
          repository: props.ecrRepo.repositoryUri,  // Pass ECR repo URI dynamically
          tag: 'latest',
        },
        service: {
          type: 'LoadBalancer',
        },
      },
    });
    
    // Apply removal policy to the underlying CloudFormation resource (CfnCluster)
    const clusterResource = this.cluster.node.defaultChild as eks.CfnCluster;
    clusterResource.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
