provider "aws" {
  region = var.aws_region
}

# ── VPC compartida para todos los ambientes ───────────────────────────────────
module "networking" {
  source = "../../modules/networking"

  environment        = "filmstars"
  vpc_cidr           = "10.0.0.0/16"
  public_subnet_cidr = "10.0.1.0/24"
  availability_zone  = "${var.aws_region}a"
}

# ── Security group: VM de bases de datos ─────────────────────────────────────
resource "aws_security_group" "db" {
  name        = "filmstars-db-sg"
  description = "VM de BDs: postgres 5433-5437 y RabbitMQ 5672"
  vpc_id      = module.networking.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "PostgreSQL - acceso desde la VPC"
    from_port   = 5432
    to_port     = 5437
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    description = "RabbitMQ AMQP - acceso desde la VPC"
    from_port   = 5672
    to_port     = 5672
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
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

  tags = { Name = "filmstars-db-sg", Environment = "filmstars", Project = "filmstars" }
}

# ── Security group: VM de develop ────────────────────────────────────────────
resource "aws_security_group" "develop" {
  name        = "filmstars-develop-sg"
  description = "VM de aplicaciones develop"
  vpc_id      = module.networking.vpc_id

  ingress {
    description = "SSH"
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
    description = "Frontend"
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
    description = "Microservicios backend"
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

  tags = { Name = "filmstars-develop-sg", Environment = "filmstars", Project = "filmstars" }
}

# ── Security group: nodos K3s ────────────────────────────────────────────────
resource "aws_security_group" "k3s" {
  name        = "filmstars-k3s-sg"
  description = "Nodos K3s master y workers"
  vpc_id      = module.networking.vpc_id

  ingress {
    description = "SSH"
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
    description = "K3s API server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "K3s - etcd peer"
    from_port   = 2379
    to_port     = 2380
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "K3s - kubelet"
    from_port   = 10250
    to_port     = 10252
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "K3s - Flannel VXLAN"
    from_port   = 8472
    to_port     = 8472
    protocol    = "udp"
    self        = true
  }

  ingress {
    description = "NodePort range"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "filmstars-k3s-sg", Environment = "filmstars", Project = "filmstars" }
}

# ── Security group: registry Zot ─────────────────────────────────────────────
resource "aws_security_group" "registry" {
  name        = "filmstars-registry-sg"
  description = "Registry Zot OCI"
  vpc_id      = module.networking.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "Zot HTTP - acceso desde la VPC"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    description = "Zot HTTP - acceso publico para CI/CD"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "filmstars-registry-sg", Environment = "filmstars", Project = "filmstars" }
}

# ── VM de bases de datos ──────────────────────────────────────────────────────
module "db_compute" {
  source = "../../modules/compute"

  environment        = "filmstars"
  key_name           = var.key_name
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [aws_security_group.db.id]

  instances = {
    "db-server" = { instance_type = "t3.small", volume_size = 30 }
  }
}

# ── VM de develop ─────────────────────────────────────────────────────────────
module "develop_compute" {
  source = "../../modules/compute"

  environment        = "filmstars"
  key_name           = var.key_name
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [aws_security_group.develop.id]

  instances = {
    "develop-server" = { instance_type = "t3.small", volume_size = 30 }
  }
}

# ── Cluster K3s ───────────────────────────────────────────────────────────────
module "k3s_compute" {
  source = "../../modules/compute"

  environment        = "filmstars"
  key_name           = var.key_name
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [aws_security_group.k3s.id]

  instances = {
    "k3s-master"  = { instance_type = "t3.small", volume_size = 30 }
    "k3s-worker-1" = { instance_type = "t3.small", volume_size = 30 }
  }
}

# ── Registry Zot ──────────────────────────────────────────────────────────────
module "registry_compute" {
  source = "../../modules/compute"

  environment        = "filmstars"
  key_name           = var.key_name
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [aws_security_group.registry.id]

  instances = {
    "registry" = { instance_type = "t3.small", volume_size = 50 }
  }
}
