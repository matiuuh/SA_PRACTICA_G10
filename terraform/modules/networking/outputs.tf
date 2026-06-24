output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC (used for intra-VPC security group rules)"
  value       = aws_vpc.main.cidr_block
}
