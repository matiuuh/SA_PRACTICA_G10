variable "environment" {
  description = "Environment name"
  type        = string
}

variable "key_name" {
  description = "Name of the AWS EC2 key pair used for SSH access"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet in which to launch instances"
  type        = string
}

variable "security_group_ids" {
  description = "List of security group IDs to attach to every instance"
  type        = list(string)
}

variable "instances" {
  description = "Map of logical instance name to its configuration"
  type = map(object({
    instance_type = string
    volume_size   = optional(number, 20)
    tags          = optional(map(string), {})
  }))
}
