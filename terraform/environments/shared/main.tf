provider "aws" {
  region = var.aws_region
}

# ── Shared VPC — hosts all environments (develop VM, K3s nodes, Zot, DB VM) ──
module "networking" {
  source = "../../modules/networking"

  environment        = "shared"
  vpc_cidr           = "10.0.0.0/16"
  public_subnet_cidr = "10.0.1.0/24"
  availability_zone  = "${var.aws_region}a"
}

# ── Security group: DB VM ─────────────────────────────────────────────────────
resource "aws_security_group" "db" {
  name        = "filmstars-db-sg"
  description = "Shared DB VM: postgres (5433-5437) and RabbitMQ (5672) accessible from within the VPC"
  vpc_id      = module.networking.vpc_id

  ingress {
    description = "SSH - Ansible and CI/CD access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "PostgreSQL external ports - services inside the VPC"
    from_port   = 5432
    to_port     = 5437
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  ingress {
    description = "RabbitMQ AMQP - services inside the VPC"
    from_port   = 5672
    to_port     = 5672
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  ingress {
    description = "RabbitMQ Management UI"
    from_port   = 15672
    to_port     = 15672
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "filmstars-db-sg"
    Environment = "shared"
    Project     = "filmstars"
  }
}

# ── DB VM (t3.small — runs 5 postgres containers + RabbitMQ) ─────────────────
module "compute" {
  source = "../../modules/compute"

  environment        = "shared"
  key_name           = var.key_name
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [aws_security_group.db.id]

  instances = {
    "db-server" = {
      instance_type = "t3.small"
      volume_size   = 30
    }
  }
}
