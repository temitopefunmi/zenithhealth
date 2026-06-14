# Zenith HealthTech – AI-Assisted Healthcare Appointment Platform

## Overview

Zenith HealthTech is a cloud-native healthcare appointment management platform built on Microsoft Azure.

The project began as a simple Azure App Service deployment exercise and has gradually evolved into a real-world engineering project that combines cloud infrastructure, DevOps automation, security, observability, serverless computing, and AI-assisted healthcare workflows.

The platform allows users to submit appointment requests in natural language, uses Azure OpenAI to extract scheduling details, validates appointment drafts through Azure Functions, and stores approved records in Azure SQL Database.

The goal of the project is to demonstrate practical cloud engineering skills while exploring how modern Azure services can be combined to build intelligent healthcare applications.

---

## Current Appointment Workflow

The current scheduling workflow follows a human-in-the-loop approach.

```text
Receptionist Request
        ↓
Natural Language Input
        ↓
Azure OpenAI
        ↓
Appointment Draft Creation
        ↓
Azure Function Validation
        ↓
Human Review
        ↓
Azure SQL Database
```

Example request:

> "Schedule Amina with Dr Smith tomorrow because she has severe chest pain."

The system extracts:

* Patient name
* Clinician
* Appointment date
* Appointment time
* Priority level
* Clinical reasoning

The appointment is then reviewed before being committed to the database.

This approach keeps AI in an assistive role rather than allowing blind automation.

---

## Key Features

### Appointment Management

* Appointment creation workflow
* Appointment draft review process
* Azure SQL-backed persistence
* Priority-based scheduling

### AI-Assisted Scheduling

* Natural language appointment requests
* Azure OpenAI extraction engine
* Automated priority classification
* Draft reasoning generation
* Human validation workflow

### Cloud-Native Infrastructure

* Infrastructure as Code (Terraform)
* GitHub Actions CI/CD
* Azure App Service hosting
* Azure Functions validation layer

### Security

* OpenID Connect (OIDC) authentication
* Managed Identity
* Azure Key Vault integration
* Key Vault References
* Least-privilege access model

### Observability

* Application Insights
* Log Analytics Workspace
* Request monitoring
* Exception tracking
* Dependency monitoring

---

## Azure Services Used

### Compute

* Azure App Service
* Azure Functions

### Data

* Azure SQL Database (Serverless)

### AI

* Azure OpenAI

### Security

* Azure Key Vault
* Managed Identity
* Microsoft Entra ID (OIDC Federation)

### Monitoring

* Application Insights
* Log Analytics Workspace

### Infrastructure & Automation

* Terraform
* GitHub Actions
* Azure Storage Account (Terraform Backend)

---

## Architecture Highlights

### Passwordless CI/CD

GitHub Actions authenticates to Azure using OpenID Connect (OIDC) federation instead of long-lived secrets.

Benefits:

* No stored client secrets
* Short-lived access tokens
* Reduced attack surface

### Identity-Based Secret Management

The application retrieves secrets through Azure Key Vault using Managed Identity.

Benefits:

* No credentials in source code
* No credentials in configuration files
* Centralized secret management

### Cost Optimization

Several cost-management strategies are implemented:

* Azure SQL Serverless with auto-pause
* Storage limits for database workloads
* Free-tier development resources where appropriate
* Infrastructure managed through Terraform for easy cleanup

---

## Project Evolution

### Phase 1

Initial Azure App Service deployment using GitHub Actions.

### Phase 2

Migration from Azure Portal management to Terraform-based Infrastructure as Code and automated CI/CD.

### Phase 3

Production-readiness improvements:

* Azure SQL Database
* OIDC Authentication
* Managed Identity
* Azure Key Vault
* Application Insights
* Log Analytics

### Phase 4

AI-assisted appointment scheduling:

* Azure OpenAI integration
* Natural language extraction
* Appointment draft generation
* Priority classification

### Phase 5 

Serverless workflow validation:

* Azure Functions
* Appointment validation layer
* Scheduling workflow orchestration
* Improved AI governance and validation

### Phase 6

Identity and Access Management

* User Assigned Managed Identity migration
* Microsoft Entra ID authentication
* NextAuth integration
* Protected application routes
* Application roles (ADMIN / DOCTOR / NURSE)
* Role propagation into sessions
* PowerShell provisioning automation

---

## Repository Documentation

Additional project documentation can be found in the `/docs` directory.

Suggested contents:

* Architecture documentation
* Engineering evolution phases
* Deployment guides
* Design decisions
* Troubleshooting notes

---

## Deployment & Initial Setup

After cloning the repository, complete the following steps.

### 1. Bootstrap Azure & GitHub OIDC

Run:

```bash
./scripts/setup.sh
```

This script prepares the Azure and GitHub authentication environment by:

- Creating the management resource group
- Creating a Storage Account and Blob Container for the Terraform state
- Creating a User Assigned Managed Identity
- Waiting for the managed identity to propagate to Microsoft Entra ID
- Assigning the Contributor role to the managed identity
- Creating GitHub OIDC federated credentials for:
  - Branch-based deployments
  - Production environment deployments
- Automatically configuring the required GitHub Secrets:
- Automatically configuring the required GitHub Variables:
- Optional: Saving the generated configuration details to `azure-setup-output.txt`. This is not pushed to repo

> No client secrets are created. Authentication between GitHub Actions and Azure uses OpenID Connect (OIDC) with a User Assigned Managed Identity.

---

### 2. Deploy the Application

Push your code to GitHub:

```bash
git push
```

GitHub Actions automatically builds and deploys the application to Azure App Service.

---

### 3. Install PowerShell Prerequisites

Run:

```powershell
.\scripts\install-prerequisites.ps1
```

Installs the required PowerShell modules, including:

- Az
- Microsoft Graph

---

### 4. Configure Microsoft Entra ID

#### Prerequisites

The setup and bootstrap scripts provision Microsoft Entra resources such as:

- App registrations
- Enterprise applications (service principals)
- App roles
- Client secrets
- Microsoft Entra users
- App role assignments

The account running these scripts must have sufficient permissions.

#### Recommended roles

- **Application Administrator**
  - Required for creating and configuring app registrations and enterprise applications.

- **User Administrator**
  - Required for creating Microsoft Entra users and assigning application roles.

> These roles are required only for provisioning and administration tasks. For production environments, follow the principle of least privilege and avoid using Global Administrator unless absolutely necessary.

#### Verify your account

Before running the scripts, ensure your signed-in account has the required Microsoft Entra roles and that you authenticate to the correct tenant. 

I recommend creating a seperate Entra account for this, I had issues using the owner account.

You can verify your Microsoft Graph session with:

```powershell
Get-MgContext
```

and reconnect if necessary:

```powershell
Disconnect-MgGraph
Connect-MgGraph
```

Run:

```powershell
.\scripts\setup-entra.ps1
```

This script:

- Connects to Microsoft Graph
- Creates the App Registration
- Creates the Enterprise Application
- Creates the ADMIN, DOCTOR and NURSE application roles
- Generates a client secret
- Generates a NextAuth secret
- Stores secrets in Azure Key Vault
- Updates the Azure App Service configuration to use Key Vault references

---

### 5. Create Users

Run:

```powershell
.\scripts\bootstrap-users.ps1
```

The script provides an interactive menu to:

- Create Admin users
- Create Doctor users
- Create Nurse users
- Create Custom users
- Assign application roles
- Generate temporary passwords
- Force password change on first sign-in

The script is safe to rerun and will reuse existing users when appropriate.


---

### Login

Once setup is complete, browse to:

```
https://<your-app>.azurewebsites.net
```

Sign in using one of the Microsoft Entra users created with `bootstrap-users.ps1`.

---

## Current Limitations

This project is still actively evolving.

Areas currently being improved include:

* Additional AI validation safeguards
* Audit logging
* Production hardening

---

## Learning Objectives

This project serves as a practical environment for learning and applying:

* Azure Cloud Engineering
* Terraform
* GitHub Actions
* DevOps Practices
* Cloud Security
* Managed Identity
* Key Vault
* Azure SQL
* Azure OpenAI
* Serverless Computing
* Observability
* Healthcare Workflow Design

---

## Author

**Temitope Olayinka**

Cloud Engineer | Azure Enthusiast | HealthTech Builder

Zenith HealthTech serves as a living project that documents my journey from basic cloud deployments to designing secure, observable, AI-assisted cloud-native healthcare applications.
