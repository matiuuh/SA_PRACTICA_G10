output "vpc_id" {
  description = "ID of the shared VPC (used by develop and release environments)"
  value       = module.networking.vpc_id
}

output "public_subnet_id" {
  description = "ID of the shared public subnet"
  value       = module.networking.public_subnet_id
}

output "vpc_cidr" {
  description = "CIDR block of the shared VPC"
  value       = module.networking.vpc_cidr
}

output "db_server_ip" {
  description = "Public Elastic IP of the DB VM (used by Ansible over SSH)"
  value       = module.compute.instance_public_ips["db-server"]
}

output "db_server_private_ip" {
  description = "Private IP of the DB VM (used by services inside the VPC to connect to postgres/RabbitMQ)"
  value       = module.compute.instance_private_ips["db-server"]
}
