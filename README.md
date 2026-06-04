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

### Phase 5 (Current)

Serverless workflow validation:

* Azure Functions
* Appointment validation layer
* Scheduling workflow orchestration
* Improved AI governance and validation

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

## Current Limitations

This project is still actively evolving.

Areas currently being improved include:

* Role-based access control (RBAC)
* Authentication and authorization
* Appointment conflict detection
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
