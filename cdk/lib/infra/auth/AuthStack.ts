import * as cdk from "aws-cdk-lib";
import { Role, ServicePrincipal, PolicyDocument } from "aws-cdk-lib/aws-iam";
import * as path from "path";
import * as fs from "fs";

export class AuthStack extends cdk.Stack {
  public readonly infraPipelineSSMRole: Role;

  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    
  }
}
