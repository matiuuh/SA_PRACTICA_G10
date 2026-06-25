output "develop_server_ip" {
  description = "Public Elastic IP of the develop server (used by Ansible and CI/CD)"
  value       = module.compute.instance_public_ips["develop-server"]
}

output "db_server_private_ip" {
  description = "Private IP of the shared DB VM (passed to Ansible so services can connect)"
  value       = data.terraform_remote_state.shared.outputs.db_server_private_ip
}

output "vpc_id" {
  description = "ID of the shared VPC"
  value       = data.terraform_remote_state.shared.outputs.vpc_id
}
