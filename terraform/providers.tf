terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure this block to store Terraform state in S3
  # (recommended so state is not stored locally or committed to git)
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "tinasportfolio/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

# WAF and ACM for CloudFront must be provisioned in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

provider "aws" {
  alias  = "secondary"
  region = var.secondary_region
}
