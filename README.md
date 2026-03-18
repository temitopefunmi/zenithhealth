
# Zenith Health - Cloud-Native Admin Portal

**Zenith Health** is a sophisticated health-tech admin dashboard designed for clinical data management and operational oversight. This project represents a strategic evolution from manual "Click-Ops" cloud management to a fully automated, enterprise-grade **DevOps** lifecycle.

## 🚀 Project Evolution: From Click-Ops to DevOps

This repository originally started as a manual deployment and has since been refactored to implement professional engineering standards:

* **Infrastructure as Code (IaC):** Replaced manual resource creation with **Terraform** for reproducible, version-controlled environments.
* **Database Automation:** Automated provisioning of **Azure SQL (Serverless)**, including firewall rules for secure service-to-service communication.
* **Zero-Trust Security (OIDC):** Migrated to **OpenID Connect (OIDC)**. This enables passwordless, short-lived token exchange between GitHub Actions and Azure via Federated Credentials, eliminating long-lived secrets.
* **Unified CI/CD:** A high-maturity **GitHub Actions** pipeline provisions the Azure infrastructure *before* building and deploying the application code in a single, seamless flow.

## 🛠 Tech Stack & Architecture

### **Frontend & Application**
* **Framework:** Next.js 13 (Node.js 22 LTS).
* **Database Client:** `mssql` (Tedious) with secure parameterization and `String.raw` handling.
* **UI Components:** React-Bootstrap, Feather Icons, and ApexCharts.

### **Cloud Infrastructure (Azure)**
* **App Service:** Managed hosting environment for the Node.js application.
* **Azure SQL:** Modern, serverless SQL database with auto-pause for cost-optimization.
* **Azure Key Vault:** Centralized secret storage. The application uses **Key Vault References** (`@Microsoft.KeyVault`) to pull secrets at runtime.
* **Managed Identity:** Implemented **User-Assigned Managed Identity**. The App Service authenticates to Key Vault using its identity, fulfilling the "Zero-Trust" model.

## 🏗 DevOps Workflow

### **1. Environment Bootstrapping & Secret Sync**
The management layer is initialized via a **Bash bootstrap script** (`setup.sh`). This script handles the "cold start" by:
* Creating the Management Resource Group and **Remote Terraform Backend**.
* Provisioning the **User-Assigned Managed Identity** for GitHub.
* **GitHub CLI Integration:** Automatically pushes `AZURE_CLIENT_ID`, `TENANT_ID`, and `SUBSCRIPTION_ID` to GitHub Secrets and Variables using the GitHub CLI (`gh`).
* **Identity Federation:** Configures the **OIDC Federated Credential** to authorize the GitHub repository.

### **2. Local Developer Experience (DX)**
A custom **Discovery Script** (`setup-env.sh`) bridges the gap between cloud and local development:
* **Automated Discovery:** Crawls the Azure Resource Group to find the SQL Server, DB Name, and Admin User.
* **Identity-Based Fetch:** Securely fetches the latest password from Key Vault using the developer's local `az login` context.
* **Zero-Error Formatting:** Automatically generates a clean `.env.local` file for the Next.js dev server.

### **3. Automated Deployment Pipeline**
The `.github/workflows/pipeline.yml` handles the full lifecycle:
* **Auth:** Logs in to Azure using OIDC (via `azure/login@v2`).
* **Infra Stage:** `terraform apply` ensures the cloud state matches the code.
* **Build & Deploy:** Compiles the app and deploys it to the provisioned Web App.

## 🏁 Step-by-Step Replication Guide

### **1. Prerequisites**
* Active **Azure Subscription**.
* **Azure CLI**, **Terraform**, **jq**, and **GitHub CLI (gh)** installed locally.
* **Node.js 22 LTS**.

### **2. Bootstrap the Cloud**
First, ensure you are authenticated with both Azure and GitHub:
```bash
az login
gh auth login

chmod +x setup.sh
./setup.sh
```
*The script will provision the management group and push all necessary secrets to your GitHub repository automatically.*

### **3. Initialize Local Environment**
Once the infrastructure is live, sync your local machine to the cloud database:
```bash
chmod +x setup-env.sh
./setup-env.sh
npm run dev
```

## 🔐 Security & Compliance
* **Passwordless Pipeline:** OIDC removes the need for `AZURE_CLIENT_SECRET`.
* **Least Privilege:** Management identities are restricted to the "Contributor" role at the subscription scope.
* **Secret Masking:** Sensitive values are stored in **GitHub Actions Secrets** and **Azure Key Vault**.

---

### 📉 Cost Optimization & Sustainability
In a production health-tech environment, data must be available, but costs must be controlled. This project implements several **FinOps** (Cloud Financial Management) strategies:

* **SQL Serverless Compute:** Utilizes the **General Purpose: Serverless** tier with an **Auto-Pause** delay. This ensures the database "sleeps" during inactive periods, reducing compute costs to $0.
* **Storage Capping:** Explicitly limits SQL storage to **2GB** (down from the 32GB default) to minimize monthly Data-at-Rest charges.
* **App Service F1 Tier:** Leverages the Free shared compute tier for dev/test environments to maintain a zero-dollar baseline for application hosting.
* **Resource Lifecycle Management:** Terraform is configured to ignore manual "Free Offer" toggles in the Azure Portal, allowing for hybrid cost-saving measures without configuration drift.

---

### 🛠 The "Wallet-Friendly" `main.tf` Update
To make sure Terraform respects your cost-saving measures, update your `azurerm_mssql_database` block like this:

```hcl
resource "azurerm_mssql_database" "sql_database" {
  name           = "db-${var.app_name}"
  server_id      = azurerm_mssql_server.sql_server.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  sku_name       = "GP_S_Gen5_1" # Serverless Gen5
  
  # 📉 Cost-Saving Configurations
  auto_pause_delay_in_minutes = 15   # Minimum allowed for maximum savings
  min_capacity                = 0.5  # Lowest possible compute floor
  max_size_gb                 = 2    # Prevents paying for unused disk space

  lifecycle {
    ignore_changes = [
      # If you click "Apply Free Offer" in the portal, 
      # this prevents Terraform from trying to "undo" it.
      requested_service_objective_name, 
      sku_name
    ]
  }
}
```



### 💡 One Last Pro-Tip
When you are done for the day, **stop your Web App** using the Azure CLI. Even if the SQL database is paused, the Web App might occasionally try to "ping" it to check health, which wakes the database up and starts the 15-minute billing timer again.

```bash
az webapp stop --name <your-app-name> --resource-group <your-rg>
```

## 📜 Credits & Acknowledgments
* **UI Base:** [DashUI Next.js Admin Template](https://github.com/codescandy/dashui-free-nextjs-admin-template).
* **Architect:** **Temitope Olayinka** — Refactored for Enterprise Cloud Automation.

---
