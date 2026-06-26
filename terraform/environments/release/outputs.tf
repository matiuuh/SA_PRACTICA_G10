output "k3s_master_ip" {
  description = "Public Elastic IP of the K3s master node (used for kubeconfig and Ingress)"
  value       = module.k3s_compute.instance_public_ips["k3s-master"]
}

output "k3s_worker_1_ip" {
  description = "Public Elastic IP of K3s worker 1"
  value       = module.k3s_compute.instance_public_ips["k3s-worker-1"]
}

output "k3s_worker_2_ip" {
  description = "Public Elastic IP of K3s worker 2"
  value       = module.k3s_compute.instance_public_ips["k3s-worker-2"]
}

output "registry_ip" {
  description = "Public Elastic IP of the Zot OCI registry (used as REGISTRY_HOST in build/deploy)"
  value       = module.registry_compute.instance_public_ips["registry"]
}

output "db_server_private_ip" {
  description = "Private IP of the shared DB VM (injected into K8s ConfigMaps at deploy time)"
  value       = data.terraform_remote_state.shared.outputs.db_server_private_ip
}
