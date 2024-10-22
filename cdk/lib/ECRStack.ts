import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as cdk from 'aws-cdk-lib';

export class ECRStack extends cdk.Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an ECR repository for the frontend
    this.repository = new ecr.Repository(this, 'FrontendRepo', {
      repositoryName: 'frontend-repo',
      removalPolicy: cdk.RemovalPolicy.DESTROY // TODO: change this when ready
    });
  }
}
