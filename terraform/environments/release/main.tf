provider "aws" {
  region = var.aws_region
}

module "networking" {
  source = "../../modules/networking"

  environment        = "release"
  vpc_cidr           = "10.2.0.0/16"
  public_subnet_cidr = "10.2.1.0/24"
  availability_zone  = "${var.aws_region}a"
}

# ── Security group: K3s cluster nodes ────────────────────────────────────────
resource "aws_security_group" "k3s" {
  name        = "filmstars-k3s-sg"
  description = "Security group for K3s master and worker nodes"
  vpc_id      = module.networking.vpc_id

  ingress {
    description = "SSH - Ansible and CI/CD access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "HTTP - nginx Ingress Controller"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS - nginx Ingress Controller"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "K3s API server - kubectl and kubeconfig access"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "K3s - etcd peer communication (intra-cluster)"
    from_port   = 2379
    to_port     = 2380
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "K3s - kubelet and controller-manager (intra-cluster)"
    from_port   = 10250
    to_port     = 10252
    protocol    = "tcp"
    self        = true
  }

  ingress {
    description = "K3s - Flannel VXLAN overlay (intra-cluster)"
    from_port   = 8472
    to_port     = 8472
    protocol    = "udp"
    self        = true
  }

  ingress {
    description = "NodePort service range"
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

  tags = {
    Name        = "filmstars-k3s-sg"
    Environment = "release"
    Project     = "filmstars"
  }
}

# ── Security group: Zot OCI registry ─────────────────────────────────────────
resource "aws_security_group" "registry" {
  name        = "filmstars-registry-sg"
  description = "Security group for the Zot OCI registry (HTTP, intra-VPC only)"
  vpc_id      = module.networking.vpc_id

  ingress {
    description = "SSH - Ansible access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "Zot HTTP registry - accessible from within the VPC"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = [module.networking.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "filmstars-registry-sg"
    Environment = "release"
    Project     = "filmstars"
  }
}

# ── K3s cluster nodes (master + 2 workers) ───────────────────────────────────
module "k3s_compute" {
  source = "../../modules/compute"

  environment        = "release"
  key_name           = var.key_name
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [aws_security_group.k3s.id]

  instances = {
    "k3s-master" = {
      instance_type = "t3.medium"
      volume_size   = 30
    }
    "k3s-worker-1" = {
      instance_type = "t3.medium"
      volume_size   = 30
    }
    "k3s-worker-2" = {
      instance_type = "t3.medium"
      volume_size   = 30
    }
  }
}

# ── Zot OCI registry ─────────────────────────────────────────────────────────
module "registry_compute" {
  source = "../../modules/compute"

  environment        = "release"
  key_name           = var.key_name
  subnet_id          = module.networking.public_subnet_id
  security_group_ids = [aws_security_group.registry.id]

  instances = {
    "registry" = {
      instance_type = "t3.small"
      volume_size   = 50
    }
  }
}
