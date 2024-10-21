import * as cdk from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface ALBStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;  // Expect the VPC to be passed as a prop
}

export class ALBStack extends cdk.Stack {
  public readonly alb: elbv2.ApplicationLoadBalancer;

  constructor(scope: cdk.App, id: string, vpc: ec2.Vpc, props?: ALBStackProps) {
    super(scope, id, props);

    // Create an Internet-facing ALB
    this.alb = new elbv2.ApplicationLoadBalancer(this, 'FrontendALB', {
      vpc,
      internetFacing: true,
    });

    // Create a listener
    const listener = this.alb.addListener('Listener', {
      port: 80,
      open: true,
    });

    // Add your target group or front-end service here
  }
}
