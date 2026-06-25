output "develop_server_ip" {
  description = "Public Elastic IP of the develop server (used by Ansible and CI/CD)"
  value       = module.compute.instance_public_ips["develop-server"]
}

output "vpc_id" {
  description = "ID of the develop VPC"
  value       = module.networking.vpc_id
}
