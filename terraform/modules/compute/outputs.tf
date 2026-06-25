output "instance_public_ips" {
  description = "Map of instance name to its Elastic (public) IP address"
  value       = { for k, v in aws_eip.this : k => v.public_ip }
}

output "instance_ids" {
  description = "Map of instance name to its EC2 instance ID"
  value       = { for k, v in aws_instance.this : k => v.id }
}
