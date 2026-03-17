terraform {
  required_providers {
    azurerm = {
        source = "hashicorp/azurerm"
        version = ">= 4.21.0"
    }
    random = {
        source = "hashicorp/random"
        version = ">= 3.4.0"
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
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}