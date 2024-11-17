import boto3

def upload_to_s3(local_path, bucket_name, s3_key):
    s3 = boto3.client("s3")
    s3.upload_file(local_path, bucket_name, s3_key)
    print(f"Uploaded {local_path} to s3://{bucket_name}/{s3_key}")

def check_training_status(job_name):
    sagemaker = boto3.client("sagemaker")
    response = sagemaker.describe_training_job(TrainingJobName=job_name)
    return response["TrainingJobStatus"]
