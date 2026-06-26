provider "aws" {
  region = var.aws_region
}

# ── Read shared state to get VPC and DB VM details ───────────────────────────
data "terraform_remote_state" "shared" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = "filmstars/shared/terraform.tfstate"
    region = var.aws_region
  }
}

resource "aws_security_group" "develop" {
  name        = "filmstars-develop-sg"
  description = "Security group for FilmStars develop environment (app services only, no DBs)"
  vpc_id      = data.terraform_remote_state.shared.outputs.vpc_id

  ingress {
    description = "SSH - Ansible and CI/CD access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend (nginx on port 5173)"
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "API Gateway"
    from_port   = 3006
    to_port     = 3006
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend microservices (3001-3007)"
    from_port   = 3001
    to_port     = 3007
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "filmstars-develop-sg"
    Environment = "develop"
    Project     = "filmstars"
  }
}

module "compute" {
  source = "../../modules/compute"

  environment        = "develop"
  key_name           = var.key_name
  subnet_id          = data.terraform_remote_state.shared.outputs.public_subnet_id
  security_group_ids = [aws_security_group.develop.id]

  instances = {
    "develop-server" = {
      instance_type = "t3.small"
      volume_size   = 30
    }
  }
}
