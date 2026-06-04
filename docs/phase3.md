# Phase 3: Building a Cloud-Native Foundation with OIDC, Azure SQL, and Secure Operations

## Overview

The goal of this phase was to transform Zenith HealthTech from an infrastructure automation project into a more production-ready cloud application.

Phase 2 introduced Infrastructure as Code using Terraform and automated deployments through GitHub Actions. While this provided a solid operational foundation, several important capabilities were still missing:

* No persistent database
* Deployment pipelines relied on stored credentials
* Secrets management was decentralized
* Limited application monitoring and diagnostics
* Opportunities to improve the overall security posture

The objective of this phase was to establish a secure, cloud-native architecture capable of supporting future healthcare workflows and application growth.

---

## Challenges Identified

### Security

GitHub Actions deployments relied on Azure Service Principal credentials stored as repository secrets.

This introduced several concerns:

* Credential leakage risk
* Secret rotation requirements
* Administrative overhead
* Long-lived credentials

### Data Persistence

The application still relied primarily on template and mock data.

Future appointment scheduling and healthcare workflows required durable, persistent storage.

### Secrets Management

Database credentials and application secrets needed a centralized management solution rather than being distributed across environments.

### Observability

Troubleshooting failures and understanding application performance remained difficult due to limited monitoring capabilities.

---

## Architecture Before Phase 3

```text
GitHub Actions
        │
        ▼
Terraform
        │
        ▼
Azure App Service
```

### Capabilities

* Infrastructure as Code
* Automated deployments
* Stable Node.js 22 runtime

### Limitations

* Static deployment credentials
* No SQL database
* No Key Vault integration
* No Managed Identity
* Limited monitoring and diagnostics

---

## Architecture After Phase 3

```text
GitHub Actions
        │
        ▼
OIDC Federation
        │
        ▼
Azure

Terraform
        │
        ▼
Azure Resources

Azure App Service
        │
        ▼
Managed Identity
        │
        ▼
Azure Key Vault
        │
        ▼
Azure SQL Database

Application Insights
        │
        ▼
Log Analytics Workspace
```

### Benefits

* Passwordless CI/CD authentication
* Centralized secret management
* Persistent data storage
* Least-privilege access controls
* Improved observability and diagnostics

---

## Azure SQL Database Integration

### Why Azure SQL?

The project required a persistent data layer to support future appointment scheduling and healthcare workflows.

Key requirements included:

* Managed database service
* Azure-native integration
* Terraform support
* Secure connectivity

Azure SQL Database met these requirements while providing a familiar relational database platform.

### Why Serverless?

Since the project primarily served as a learning environment, cost optimization was an important consideration.

Azure SQL Serverless offered:

* Automatic pause and resume capabilities
* Consumption-based billing
* Reduced idle costs

One important discovery during implementation was that serverless does not automatically mean free. Depending on configuration and usage patterns, costs can still accumulate.

To minimize expenses, I researched Azure SQL free-tier options and ultimately leveraged a Bicep-based deployment approach to provision a free-tier database for experimentation and development.

---

## Connecting the Application to Azure SQL

Provisioning a database alone does not make an application data-driven.

The application still relied heavily on template data, so a secure integration layer was required to support:

* Appointment creation
* Appointment retrieval
* Record updates
* Dynamic data presentation

### Implementation Approach

I introduced backend API endpoints using Next.js API Routes.

Responsibilities included:

* Executing database queries
* Creating appointment records
* Retrieving appointment data
* Handling server-side business logic

This established a clear separation of concerns:

```text
Frontend UI
        │
        ▼
API Routes
        │
        ▼
Azure SQL Database
```

### Technical Decisions

#### Connection Pooling

The application uses the `mssql` driver with a singleton connection pattern.

Benefits include:

* Reduced database connection overhead
* Improved application performance
* More efficient resource utilization

#### Environment-Based Configuration

Database settings are supplied through environment variables rather than hardcoded values.

Examples include:

```text
DB_SERVER
DB_NAME
DB_USER
DB_PASSWORD
```

This allows the same codebase to operate across multiple environments without modification.

### User Experience Considerations

Because Azure SQL Serverless can automatically pause during inactivity, users may occasionally experience delays while the database resumes.

To improve the user experience:

* Loading indicators were introduced
* User feedback messages were added
* The interface remained responsive during database wake-up events

### Outcome

The application transitioned from:

```text
Static Template Data
```

to:

```text
Live Azure SQL Data
```

This marked the first major step toward building a functional healthcare platform rather than simply hosting a dashboard template.

---

## Passwordless CI/CD with OIDC

### Previous Approach

GitHub Actions authenticated to Azure using Service Principal credentials stored as repository secrets.

Required values included:

* Client ID
* Tenant ID
* Client Secret

While functional, this approach introduced operational and security challenges.

### New Approach

To eliminate long-lived credentials, I implemented OpenID Connect (OIDC) federation.

Authentication now follows this flow:

```text
GitHub Workflow
        │
        ▼
OIDC Token
        │
        ▼
Microsoft Entra ID Validation
        │
        ▼
Temporary Access Token
```

### Benefits

* No stored passwords
* Short-lived credentials
* Reduced attack surface
* Simplified credential management

This significantly improved the security model of the deployment pipeline.

---

## Managed Identity Implementation

### The Challenge

The application required secure access to:

* Azure Key Vault
* Database credentials
* Future Azure services

Embedding secrets directly within the application was not an acceptable solution.

### The Solution

A System-Assigned Managed Identity was enabled on Azure App Service.

Benefits included:

* No embedded credentials
* Azure-managed identity lifecycle
* Support for least-privilege access patterns

### Real-World Issue Encountered

During implementation, the application encountered an `AccessToKeyVaultDenied` error.

The Managed Identity existed and was functioning correctly, but it lacked the necessary authorization to access secrets within Azure Key Vault.

The issue was resolved by configuring the appropriate Key Vault permissions and access policies.

This reinforced an important lesson:

Authentication and authorization are separate concerns. Having a valid identity does not automatically grant access to protected resources.

---

## Centralized Secret Management with Azure Key Vault

As the project matured, the number of sensitive values increased.

Examples included:

* Database passwords
* API keys
* Application secrets
* Future integration credentials

Azure Key Vault was introduced to provide:

* Centralized secret storage
* Auditing capabilities
* Secure secret retrieval
* Simplified secret rotation

### Integration Pattern

```text
Azure Key Vault
        │
        ▼
Managed Identity
        │
        ▼
Azure App Service
```

Sensitive values such as database credentials were retrieved through Key Vault references rather than stored directly in source code or application settings.

### Benefits

* No secrets committed to source control
* No hardcoded credentials in application code
* Centralized secret administration

---

## CI/CD Pipeline Maturity

### Previous State

The deployment workflow focused primarily on application build and deployment.

### Improvements

The pipeline evolved to include:

* OIDC authentication
* Terraform-based infrastructure provisioning
* Environment bootstrap automation
* GitHub CLI integration

### Bootstrap Automation

Additional automation was created to streamline environment setup.

The bootstrap process automates:

* Identity creation
* OIDC federation configuration
* GitHub secret configuration
* Azure RBAC assignments

The goal was to reduce manual configuration and improve deployment consistency.

---

## Improving Observability

### The Challenge

Application failures were difficult to diagnose, and there was limited visibility into application health and performance.

### The Solution

Two Azure monitoring services were introduced:

* Application Insights
* Log Analytics Workspace

The platform now collects:

* Application exceptions
* Request metrics
* Response times
* Dependency failures

### Benefits

* Faster troubleshooting
* Improved operational visibility
* Centralized diagnostics
* Better understanding of application behavior

---

## Key Lessons Learned

### 1. Automation Is Not the Same as Security

Phase 2 automated deployments.

Phase 3 focused on securing those deployments.

Both are necessary for production-ready systems.

### 2. Identity Is the Foundation of Modern Cloud Security

OIDC and Managed Identity eliminated the need for long-lived credentials and significantly improved security.

### 3. Cloud Costs Require Active Management

Serverless services can reduce costs, but they still require careful configuration and monitoring.

### 4. Authorization Matters as Much as Authentication

The Key Vault access issue demonstrated that a valid identity alone is not sufficient. Permissions must also be correctly configured.

### 5. Monitoring Should Be Built In, Not Added Later

Observability is a core architectural component, not an afterthought. Monitoring capabilities should be implemented before incidents occur.

---

## Conclusion

Phase 3 transformed Zenith HealthTech from an automated deployment platform into a more secure, cloud-native application.

By introducing Azure SQL Database, implementing passwordless CI/CD with OIDC, adopting Managed Identity and Azure Key Vault for secret management, and adding comprehensive monitoring through Application Insights and Log Analytics, the platform gained significant improvements in security, operational visibility, and maintainability.

These enhancements established the foundation required to support future healthcare workflows while aligning the architecture more closely with modern cloud engineering practices.
