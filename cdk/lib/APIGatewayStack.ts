import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class APIGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define API Gateway
    const api = new apigateway.RestApi(this, 'MyAPIGateway', {
      restApiName: 'BackendServicesAPI',
      description: 'API Gateway for EKS Microservices',
    });

    // Add methods and routes for each microservice
    const serviceEndpoint = api.root.addResource('service1');
    serviceEndpoint.addMethod('GET', new apigateway.HttpIntegration('http://service-url-in-eks'));
  }
}
