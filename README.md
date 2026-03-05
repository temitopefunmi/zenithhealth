# Zenith Health - Cloud-Native Admin Portal

**Zenith Health** is a sophisticated health-tech admin dashboard designed for clinical data management and operational oversight. This project represents a strategic evolution from manual "Click-Ops" cloud management to a fully automated, enterprise-grade **DevOps** lifecycle.

## 🚀 Project Evolution: From Click-Ops to DevOps

This repository originally started as a manual deployment using the Azure Portal. It has since been refactored to implement professional engineering standards:

* **Infrastructure as Code (IaC):** Replaced manual resource creation with **Terraform** to ensure reproducible and version-controlled environments.


* **Unified CI/CD:** Developed a high-maturity **GitHub Actions** pipeline that provisions the entire Azure infrastructure *before* building and deploying the application code.


* **Zero-Trust Security:** Implemented secure authentication using an **Azure Service Principal** and encrypted **GitHub Secrets**, eliminating the risk of credential leakage in the codebase.



## 🛠 Tech Stack & Architecture

### **Frontend & Application**

* **Framework:** Next.js 13 (Upgraded to **Node.js 22 LTS** for enhanced security and long-term support).


* **UI Components:** React-Bootstrap, ApexCharts, and Feather Icons.


* **Base Template:** [DashUI Next.js Free Admin Template](https://github.com/codescandy/dashui-free-nextjs-admin-template) by Codescandy.



### **Cloud Infrastructure (Azure)**

* **App Service:** Managed hosting environment for the Node.js application.


* **App Service Plan:** Linux-based compute resource (B1 Tier).


* **Storage Account:** Configured as a **Remote Terraform Backend** to maintain state integrity across team members.



## 🏗 DevOps Workflow

### **1. Environment Bootstrapping**

To ensure a clean and secure start in a new Azure subscription, the environment is initialized using a custom **Bash bootstrap script** (`setup.sh`). This script automates:

1. Creating the Management Resource Group.


2. Provisioning the Storage Account and Container for the Terraform state.


3. Generating the **Service Principal** with the "Contributor" role for automated access.



### **2. Automated Deployment Pipeline**

The `.github/workflows/devops-pipeline.yml` handles the full application lifecycle on every `git push` to the `main` branch:

* **Infra Stage:** Runs `terraform apply` to create/update Azure resources.


* **Build Stage:** Compiles the Next.js app using Node.js 22.


* **Deploy Stage:** Securely packages the application and deploys it to the provisioned Azure Web App.



## 🏁 Step-by-Step Replication Guide

Follow these steps to deploy the Zenith Health platform into your own Azure environment.

### **1. Prerequisites**

* An active **Azure Subscription**.
* **Azure CLI** and **Terraform** installed locally.


* **Node.js 22 LTS** installed.



### **2. Bootstrap the Infrastructure**

Before running the automation, you must authenticate your terminal with Azure and ensure you are targeting the correct subscription (especially important if you are using a new account with free credits).

```bash
# Log in to your Azure account
az login

# (Optional) Set the specific subscription if you have multiple
az account set --subscription "YOUR_SUBSCRIPTION_NAME_OR_ID"
```

Run the included `setup.sh` script to create the management layer in Azure. This creates the Storage Account for Terraform's state and a Service Principal for GitHub.

```bash
chmod +x setup.sh
./setup.sh

```

**Action:** Open the generated `azure-setup-output.txt` and copy the credentials. **Do not commit this file**.

### **3. Configure GitHub Secrets**

In your GitHub Repo, navigate to **Settings > Secrets and variables > Actions** and add the following: 

* `AZURE_CLIENT_ID`
* `AZURE_TENANT_ID`
* `AZURE_SUBSCRIPTION_ID`
* `AZURE_CLIENT_SECRET`

### **4. Initialize Terraform Backend**

Update the `backend "azurerm"` block in your `terraform` configuration with the `storage_account_name` provided in your setup output.

### **5. Deploy**

Simply push your changes to the `main` branch. The GitHub Action will automatically initialize Terraform, build the application (Node 22), and deploy it to your new Azure environment.

## 🔐 Security & Compliance

In alignment with health-tech security standards:

* **State Locking:** Remote state storage prevents concurrent configuration changes.


* **Identity Management:** Automated deployments use a dedicated Service Principal, following the principle of **Least Privilege**.


* **Secret Masking:** All sensitive values (Subscription IDs, Client Secrets) are stored in **GitHub Actions Secrets**.



## 📜 Credits & Acknowledgments

* **UI Base:** This project utilizes the [DashUI Next.js Admin Template](https://github.com/codescandy/dashui-free-nextjs-admin-template) by Codescandy.


* **DevOps Architect:** Adapted and "Enterprise-ified" by **Temitope Olayinka** as part of a specialized Cloud & DevOps engineering portfolio.