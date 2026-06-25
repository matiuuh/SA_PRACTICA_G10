provider "aws" {
  region = var.aws_region
}

module "networking" {
  source = "../../modules/networking"

  environment        = "develop"
  vpc_cidr           = "10.1.0.0/16"
  public_subnet_cidr = "10.1.1.0/24"
  availability_zone  = "${var.aws_region}a"
}

resource "aws_security_group" "develop" {
  name        = "filmstars-develop-sg"
  description = "Security group for FilmStars develop environment (all-in-one Docker Compose)"
  vpc_id      = module.networking.vpc_id

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
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [aws_security_group.develop.id]

  instances = {
    "develop-server" = {
      instance_type = "t3.small"
      volume_size   = 30
    }
  }
}
