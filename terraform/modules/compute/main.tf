data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "this" {
  for_each = var.instances

  ami                    = data.aws_ami.ubuntu.id
  instance_type          = each.value.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids

  root_block_device {
    volume_size = each.value.volume_size
    volume_type = "gp3"
    encrypted   = true
  }

  tags = merge(
    {
      Name        = "filmstars-${var.environment}-${each.key}"
      Environment = var.environment
      Project     = "filmstars"
      Role        = each.key
    },
    each.value.tags
  )
}

resource "aws_eip" "this" {
  for_each = var.instances

  domain   = "vpc"
  instance = aws_instance.this[each.key].id

  tags = {
    Name        = "filmstars-${var.environment}-${each.key}-eip"
    Environment = var.environment
    Project     = "filmstars"
  }
}
