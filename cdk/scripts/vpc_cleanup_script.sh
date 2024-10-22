#!/bin/bash

# Usage: ./cleanup_vpc.sh <vpc-id> <region>
# Example: ./cleanup_vpc.sh vpc-0a1b2c3d4e5f6g7h us-east-1

VPC_ID=$1
REGION=$2

if [ -z "$VPC_ID" ] || [ -z "$REGION" ]; then
    echo "Usage: $0 <vpc-id> <region>"
    exit 1
fi

echo "Cleaning up VPC: $VPC_ID in region: $REGION"

# Function to detach and delete ENIs
delete_enis() {
    echo "Deleting Network Interfaces..."
    ENIS=$(aws ec2 describe-network-interfaces --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'NetworkInterfaces[*].NetworkInterfaceId' --output text)

    if [ "$ENIS" ]; then
        for eni in $ENIS; do
            echo "Checking Network Interface: $eni"
            STATUS=$(aws ec2 describe-network-interfaces --network-interface-ids $eni --region $REGION --query 'NetworkInterfaces[0].Status' --output text)

            if [ "$STATUS" = "available" ]; then
                echo "Deleting available Network Interface: $eni"
                aws ec2 delete-network-interface --network-interface-id $eni --region $REGION
            else
                ATTACHMENT_ID=$(aws ec2 describe-network-interfaces --network-interface-ids $eni --region $REGION --query 'NetworkInterfaces[0].Attachment.AttachmentId' --output text)

                if [ "$ATTACHMENT_ID" != "None" ]; then
                    echo "Detaching Network Interface: $eni"
                    aws ec2 detach-network-interface --attachment-id $ATTACHMENT_ID --region $REGION
                    aws ec2 wait network-interface-available --network-interface-ids $eni --region $REGION
                fi

                echo "Deleting Network Interface: $eni"
                aws ec2 delete-network-interface --network-interface-id $eni --region $REGION
            fi
        done
    else
        echo "No Network Interfaces found."
    fi
}

# Delete NAT Gateways
echo "Deleting NAT Gateways..."
NAT_GATEWAYS=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'NatGateways[*].NatGatewayId' --output text)

if [ "$NAT_GATEWAYS" ]; then
    for nat_gateway in $NAT_GATEWAYS; do
        echo "Deleting NAT Gateway: $nat_gateway"
        aws ec2 delete-nat-gateway --nat-gateway-id $nat_gateway --region $REGION
        aws ec2 wait nat-gateway-deleted --nat-gateway-id $nat_gateway --region $REGION
    done
else
    echo "No NAT Gateways found."
fi

# Delete Internet Gateway
echo "Deleting Internet Gateway..."
IGW_ID=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --region $REGION --query 'InternetGateways[*].InternetGatewayId' --output text)

if [ "$IGW_ID" ]; then
    echo "Detaching and Deleting Internet Gateway: $IGW_ID"
    aws ec2 detach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID --region $REGION
    aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID --region $REGION
else
    echo "No Internet Gateway found."
fi

# Delete Subnets
echo "Deleting Subnets..."
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'Subnets[*].SubnetId' --output text)

if [ "$SUBNETS" ]; then
    for subnet in $SUBNETS; do
        echo "Deleting Subnet: $subnet"
        aws ec2 delete-subnet --subnet-id $subnet --region $REGION
    done
else
    echo "No Subnets found."
fi

# Delete Route Tables
echo "Deleting Route Tables..."
ROUTE_TABLES=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'RouteTables[*].RouteTableId' --output text)

if [ "$ROUTE_TABLES" ]; then
    for route_table in $ROUTE_TABLES; do
        MAIN_RT_ASSOC=$(aws ec2 describe-route-tables --route-table-id $route_table --query 'RouteTables[0].Associations[0].Main' --output text)
        if [ "$MAIN_RT_ASSOC" == "True" ]; then
            echo "Skipping main route table: $route_table"
        else
            echo "Deleting Route Table: $route_table"
            aws ec2 delete-route-table --route-table-id $route_table --region $REGION
        fi
    done
else
    echo "No Route Tables found."
fi

# Delete Security Groups
echo "Deleting Security Groups..."
SECURITY_GROUPS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'SecurityGroups[*].GroupId' --output text)

if [ "$SECURITY_GROUPS" ]; then
    for sg in $SECURITY_GROUPS; do
        if [ "$sg" != "default" ]; then
            echo "Deleting Security Group: $sg"
            aws ec2 delete-security-group --group-id $sg --region $REGION
        else
            echo "Skipping default Security Group."
        fi
    done
else
    echo "No Security Groups found."
fi

# Delete Load Balancers (ELB and ALB/NLB)
echo "Deleting Load Balancers..."
LOAD_BALANCERS=$(aws elbv2 describe-load-balancers --region $REGION --query 'LoadBalancers[?VpcId==`'$VPC_ID'`].LoadBalancerArn' --output text)
CLASSIC_LOAD_BALANCERS=$(aws elb describe-load-balancers --region $REGION --query 'LoadBalancerDescriptions[?VPCId==`'$VPC_ID'`].LoadBalancerName' --output text)

if [ "$LOAD_BALANCERS" ]; then
    for lb in $LOAD_BALANCERS; do
        echo "Deleting Load Balancer: $lb"
        aws elbv2 delete-load-balancer --load-balancer-arn $lb --region $REGION
        aws elbv2 wait load-balancer-deleted --load-balancer-arn $lb --region $REGION
    done
else
    echo "No Load Balancers (ALB/NLB) found."
fi

if [ "$CLASSIC_LOAD_BALANCERS" ]; then
    for clb in $CLASSIC_LOAD_BALANCERS; do
        echo "Deleting Classic Load Balancer: $clb"
        aws elb delete-load-balancer --load-balancer-name $clb --region $REGION
        aws elb wait load-balancer-deleted --load-balancer-name $clb --region $REGION
    done
else
    echo "No Classic Load Balancers found."
fi

# Delete Elastic IPs (EIPs)
echo "Releasing Elastic IPs..."
EIPS=$(aws ec2 describe-addresses --filters "Name=domain,Values=vpc" "Name=allocation-id,Values=$VPC_ID" --region $REGION --query 'Addresses[*].AllocationId' --output text)

if [ "$EIPS" ]; then
    for eip in $EIPS; do
        echo "Releasing Elastic IP: $eip"
        aws ec2 release-address --allocation-id $eip --region $REGION
    done
else
    echo "No Elastic IPs found."
fi

# Force Delete ENIs
delete_enis

# Delete VPC
echo "Deleting VPC..."
aws ec2 delete-vpc --vpc-id $VPC_ID --region $REGION

if [ $? -eq 0 ]; then
    echo "VPC $VPC_ID deleted successfully."
else
    echo "Failed to delete VPC $VPC_ID."
fi
