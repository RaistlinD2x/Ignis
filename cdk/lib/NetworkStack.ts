import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecs from 'aws-cdk-lib/aws-ecs'

interface NetworkStackProps extends cdk.StackProps {
  envName: string; // Add envName to the props
}

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: cdk.App, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    // Define a VPC with public and private subnets, using the envName to namespace the VPC name
    this.vpc = new ec2.Vpc(this, `Vpc-${props.envName}`, {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `Public-${props.envName}`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: `Private-${props.envName}`,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
      vpcName: `Vpc-${props.envName}`, // Explicitly name the VPC
    });

    // Create an Internet-facing ALB, using the envName for namespacing
    this.alb = new elbv2.ApplicationLoadBalancer(this, `ALB-${props.envName}`, {
      vpc: this.vpc,
      internetFacing: true,
      loadBalancerName: `alb-${props.envName}`, // Explicitly name the ALB
    });

    // TODO: remove this when ready
    // Ensure VPC and related resources are destroyed on stack deletion
    this.vpc.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // Optionally, you can apply the removal policy to specific sub-resources as well
    this.vpc.publicSubnets.forEach(subnet => {
      subnet.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    });
    this.vpc.privateSubnets.forEach(subnet => {
      subnet.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    });

  //   // Define a listener for the ALB
  //   const listener = this.alb.addListener(`Listener-${props.envName}`, {
  //     port: 80,
  //     open: true,
  //   });

  //   // Add target groups or services as needed
  //   // Add target group or action
  //   listener.addTargets('TargetGroup', {
  //     port: 80,
  //     targets: [new ecs.EcsService(...)]
  }
}
