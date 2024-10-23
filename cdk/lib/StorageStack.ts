import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class StorageStack extends cdk.Stack {
  public readonly helmBucket: s3.Bucket;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the S3 bucket
    this.helmBucket = new s3.Bucket(this, 'HelmChartBucket', {
      versioned: true,  // Versioned for backup safety
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Destroy bucket when stack is deleted
      autoDeleteObjects: true, // Automatically delete objects on bucket removal
    });
  }
}
