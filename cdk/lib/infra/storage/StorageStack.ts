import * as cdk from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

export class StorageStack extends cdk.Stack {
  public readonly helmBucket: Bucket;

  constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // Define the Helm S3 Bucket
    this.helmBucket = new Bucket(this, `HelmS3Bucket`, {
      bucketName: `ignis-helm-chart-bucket`, // Make sure it's unique globally
      removalPolicy: RemovalPolicy.DESTROY, // Destroy bucket when the stack is deleted
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL, // Secure the bucket
    });
  }
}
