terraform {
  required_providers {
    azurerm = {
        source = "hashicorp/azurerm"
        version = ">= 4.21.0"
    }
  
}

  backend "azurerm" {
    resource_group_name   = var.mgmt_resource_group_name
    storage_account_name  = "zenithtfstate1772695633"
    container_name        = "tfstate"
    key                   = "terraform.tfstate"
}
}

provider "azurerm" {
  features {}
}