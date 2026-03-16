variable "resource_group_name" {
  description = "The name of the resource group"
  type = string
}

variable "mgmt_resource_group_name" {
  description = "The name of the management resource group for identity and secrets"
  type = string
}

variable "location" {
  description = "The Azure region where resources will be created"
  type = string
}

variable "app_name" {
  description = "The name of the application"
  type = string
}

variable "github_repo" {
  type        = string
  description = "The GitHub repository in the format 'username/repo-name'"
}

variable "storage_account_name" {
  
}