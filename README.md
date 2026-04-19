
# Zenith Health - Cloud-Native Admin Portal

**Zenith Health** is a sophisticated health-tech admin dashboard designed for clinical data management and operational oversight. This project represents a strategic evolution from manual "Click-Ops" cloud management to a fully automated, enterprise-grade **DevOps** lifecycle.

## Why this project exists

Zenith Health is my hands-on learning ground for building more realistic cloud-native health-tech workflows.

I use this project to move beyond tutorials and apply Azure, DevOps, and AI concepts in a practical system that keeps evolving as I learn. The goal is not to present this as a finished clinical production system, but as a portfolio project that shows how I think through architecture, tradeoffs, debugging, and product workflow design.

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

## Current Application Workflow

The current appointment workflow looks like this:

1. A receptionist enters a free-text booking request
2. Azure OpenAI extracts appointment details such as patient, doctor, date/time, and priority
3. The system creates a draft appointment
4. A doctor reviews the AI reasoning before confirming the appointment

This keeps AI in an assistive role instead of allowing blind automation.

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

### 🛠 How the SQL Database Is Provisioned

In the current version of Zenith Health, the SQL database is not created directly with an `azurerm_mssql_database` resource.

Instead, Terraform deploys the database through a Bicep/ARM template deployment.

This approach was used because the SQL database configuration eventually moved beyond the simpler direct Terraform resource approach, and the Bicep deployment gave me more flexibility in how the serverless SQL database was defined and deployed.

The Bicep file is compiled during the GitHub Actions pipeline before Terraform runs, so Terraform can still manage the overall deployment flow while the SQL database definition lives in the generated ARM template.

### 💡 One Last Pro-Tip
When you are done for the day, **stop your Web App** using the Azure CLI. Even if the SQL database is paused, the Web App might occasionally try to "ping" it to check health, which wakes the database up and starts the 15-minute billing timer again.

```bash
az webapp stop --name <your-app-name> --resource-group <your-rg>
```
## Current Limitations / In Progress

This project is still evolving, and there are some known areas being improved:

- Full server-enforced authentication and role-based access control are not yet complete
- AI input/output validation can still be strengthened further
- Some schema management shortcuts used for rapid iteration should move toward cleaner migrations
- Some template-derived structure/components are still being cleaned up
- Production hardening is still in progress

## Recent Engineering Lessons

A few of the practical issues this project has helped me work through:

- Azure SQL cold starts and retry handling
- stale connection pool recovery after failed database wake-ups
- Azure OpenAI model deprecations and the need for stable deployment naming
- designing AI-assisted workflows with human review instead of blind automation
- balancing portfolio speed with cleaner architecture over time

## 📜 Credits & Acknowledgments
* **UI Base:** [DashUI Next.js Admin Template](https://github.com/codescandy/dashui-free-nextjs-admin-template).
* **Architect:** **Temitope Olayinka** — Refactored for Enterprise Cloud Automation.

---
