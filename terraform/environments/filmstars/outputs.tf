output "db_server_ip" {
  description = "IP publica de la VM de bases de datos"
  value       = module.db_compute.instance_public_ips["db-server"]
}

output "db_server_private_ip" {
  description = "IP privada de la VM de bases de datos (para conectar microservicios)"
  value       = module.db_compute.instance_private_ips["db-server"]
}

output "develop_server_ip" {
  description = "IP publica de la VM de develop"
  value       = module.develop_compute.instance_public_ips["develop-server"]
}

output "k3s_master_ip" {
  description = "IP publica del nodo master K3s"
  value       = module.k3s_compute.instance_public_ips["k3s-master"]
}

output "k3s_worker_1_ip" {
  description = "IP publica del worker 1 K3s"
  value       = module.k3s_compute.instance_public_ips["k3s-worker-1"]
}

output "registry_ip" {
  description = "IP publica del registry Zot"
  value       = module.registry_compute.instance_public_ips["registry"]
}

output "vpc_id" {
  description = "ID del VPC"
  value       = module.networking.vpc_id
}
