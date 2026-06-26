variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "key_name" {
  description = "Name of the AWS EC2 key pair for SSH access (must exist in the target region)"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into instances. Use 0.0.0.0/0 for GitHub-hosted runners."
  type        = string
  default     = "0.0.0.0/0"
}

variable "tf_state_bucket" {
  description = "S3 bucket used for Terraform state (needed to read the shared environment outputs)"
  type        = string
}
