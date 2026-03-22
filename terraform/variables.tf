variable "resource_group_name" {
  description = "The name of the resource group"
  type = string
  default = "rg-ZenithHealth"
}

variable "mgmt_resource_group_name" {
  description = "The name of the management resource group for identity and secrets"
  type = string
  default = "rg-zenith-mgmt"
}

variable "location" {
  description = "The Azure region where resources will be created"
  type = string
  default = "westeurope"
}

variable "app_name" {
  description = "The name of the application"
  type = string
  default = "zht-dashboard"
}

variable "github_repo" {
  type        = string
  description = "The GitHub repository in the format 'username/repo-name'"
  default     = "temitopefunmi/zenith-health"
}

variable "storage_account_name" {
  type        = string
  description = "The name of the storage account for Terraform state"
  default     = "zenithtfstate1773664450"
}

variable "sql_admin_username" {
  type        = string
  description = "The admin username for the SQL Server"
  default     = "sqladminuser"
}