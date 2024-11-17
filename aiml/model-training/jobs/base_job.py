import boto3
import json
import argparse

def launch_training_job(config_path):
    # Load job configuration
    with open(config_path, "r") as f:
        config = json.load(f)
    
    # Initialize SageMaker client
    sagemaker = boto3.client("sagemaker")

    # Create the training job
    response = sagemaker.create_training_job(
        TrainingJobName=config["TrainingJobName"],
        AlgorithmSpecification=config["AlgorithmSpecification"],
        RoleArn=config["RoleArn"],
        InputDataConfig=config["InputDataConfig"],
        OutputDataConfig=config["OutputDataConfig"],
        ResourceConfig=config["ResourceConfig"],
        StoppingCondition=config["StoppingCondition"],
        HyperParameters=config.get("HyperParameters", {}),
    )
    print(f"Training job launched: {response['TrainingJobArn']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, help="Path to job configuration file")
    args = parser.parse_args()
    launch_training_job(args.config)
