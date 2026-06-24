terraform {
  backend "s3" {
    # Partial configuration — the following keys are supplied via
    # -backend-config flags during `terraform init` in CI/CD:
    #   bucket         = ${{ secrets.TF_STATE_BUCKET }}
    #   region         = ${{ secrets.AWS_REGION }}
    #   dynamodb_table = ${{ secrets.TF_STATE_LOCK_TABLE }}
    key     = "filmstars/develop/terraform.tfstate"
    encrypt = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.6.0"
}
