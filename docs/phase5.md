# Phase 5: Serverless Validation and Workflow Orchestration

## Overview

The goal of this phase was to introduce a dedicated validation layer between AI-generated appointment drafts and final appointment creation.

In Phase 4, Azure OpenAI successfully extracted appointment information from natural language requests and generated structured appointment drafts. While this significantly improved the scheduling workflow, it also exposed an important architectural concern:

AI-generated output should not be trusted blindly.

The system needed a reliable way to:

* Validate extracted data
* Enforce business rules
* Identify missing information
* Prepare for future scheduling checks
* Maintain human oversight

To address these requirements, I introduced Azure Functions as a dedicated serverless validation service.

This phase represented an important architectural evolution by separating AI-powered information extraction from deterministic business validation.

---

## Problem Statement

The existing workflow looked like this:

```text id="wf01"
Receptionist
      │
      ▼
Natural Language Request
      │
      ▼
Azure OpenAI
      │
      ▼
Appointment Draft
      │
      ▼
Human Review
      │
      ▼
Azure SQL Database
```

While functional, this architecture had limitations.

Azure OpenAI could successfully extract information such as:

* Patient names
* Clinician names
* Appointment dates
* Priority levels

However, AI was not the appropriate place to enforce business rules.

Future requirements would include:

* Required field validation
* Appointment date validation
* Scheduling conflict detection
* Doctor availability checks
* Office hours restrictions
* Holiday scheduling rules

Embedding these rules inside prompts would become increasingly difficult to maintain as the application evolved.

The architecture required a dedicated validation layer.

---

## Architecture Before Phase 5

```text id="wf02"
Receptionist
      │
      ▼
Azure OpenAI
      │
      ▼
Appointment Draft
      │
      ▼
Human Review
      │
      ▼
Azure SQL Database
```

### Characteristics

* AI-driven extraction
* Limited validation
* Business rules embedded within application logic
* Difficult to scale validation capabilities

---

## Architecture After Phase 5

```text id="wf03"
Receptionist
      │
      ▼
Azure OpenAI
      │
      ▼
Appointment Draft
      │
      ▼
Azure Function
      │
      ▼
Validation
      │
      ▼
Human Review
      │
      ▼
Azure SQL Database
```

### Benefits

* Clear separation of concerns
* Dedicated validation service
* Easier maintenance
* Independent scaling
* Support for future scheduling workflows
* Greater architectural flexibility

---

## Implementing a Validation Service with Azure Functions

### Why Azure Functions?

The validation layer required a solution that was:

* Serverless
* Event-driven
* Azure-native
* Easy to deploy independently
* Low operational overhead

Azure Functions provided a lightweight platform for implementing business validation logic without introducing unnecessary infrastructure complexity.

### Architectural Decision

Rather than placing validation logic directly inside the Next.js application, I created a dedicated validation service.

The service is responsible for:

* Validating appointment drafts
* Checking for missing information
* Validating appointment dates
* Returning workflow status information
* Preparing the platform for future scheduling rules

This separation allows AI extraction and business validation to evolve independently.

---

## Appointment Draft Validation Workflow

The validation service returns structured workflow states that determine the next step in the scheduling process.

### Ready

All required information is present and valid.

The appointment draft can proceed to review and scheduling.

### Missing Fields

Required information is missing from the appointment draft.

Examples include:

* Patient name
* Appointment date
* Clinician information

Additional information must be collected before scheduling can continue.

### Needs Slot Selection

The request does not contain a valid appointment date or time.

The application can present available appointment slots for user selection.

### Invalid

The submitted information contains invalid values.

Examples include:

* Malformed dates
* Unsupported values
* Invalid scheduling data

### Error

An unexpected validation failure occurred and requires further investigation.

### Benefits

This structured workflow makes the scheduling process predictable and easier to extend.

Future validation rules can be added without modifying the AI extraction layer.

---

## Azure Function Infrastructure

Introducing Azure Functions required several supporting Azure resources.

### Components Added

* Function App
* Storage Account
* App Service Plan
* Resource Group integration

All resources were provisioned and managed through Terraform.

### Deployment Strategy

The validation service follows the same Infrastructure as Code and CI/CD practices established in previous phases.

GitHub Actions automatically:

* Builds the function code
* Packages deployment artifacts
* Deploys updates to Azure

This keeps infrastructure and application deployments aligned.

---

## Function Security and Secret Management

### Security Requirements

The Function App requires secure access to Azure resources and application secrets.

Requirements included:

* Key Vault integration
* Secret retrieval
* Future service integrations

### Managed Identity

The Function App uses Azure Managed Identity rather than embedded credentials.

Benefits include:

* No hardcoded secrets
* Azure-managed authentication
* Reduced credential management overhead
* Support for least-privilege access patterns

### Azure Key Vault Integration

The Function App follows the same secret management model established for the web application.

```text id="wf04"
Azure Key Vault
        │
        ▼
Managed Identity
        │
        ▼
Function App
```

This provides a consistent security architecture across platform components.

---

## Challenges Encountered

### Linux Consumption Plan Limitations

During deployment, Azure returned an error indicating that the requested Linux Consumption configuration was not available within the target resource group.

#### Root Cause

The resource group could not host the requested Linux Consumption plan configuration.

#### Resolution

A dedicated resource group was created for the Function App deployment, and the infrastructure architecture was adjusted accordingly.

---

### Function Deployment Failures

Initial deployments failed because application code was being deployed before infrastructure provisioning had completed.

#### Root Cause

Resource creation and deployment sequencing were not properly aligned.

#### Resolution

Terraform execution and deployment workflow coordination were improved to ensure infrastructure was available before deployment began.

---

### Artifact Management Issues

The deployment pipeline experienced failures when attempting to retrieve build artifacts.

#### Error

```text id="wf05"
Artifact not found
```

#### Root Cause

The separation between CI and CD workflows created artifact dependency issues.

#### Resolution

The deployment process was simplified and workflow consistency was improved.

---

### Key Vault Authorization Issues

After introducing the Function App, Key Vault references unexpectedly failed.

#### Root Cause

The Managed Identity existed but lacked the required authorization within Azure Key Vault.

#### Resolution

Key Vault permissions were updated and identity assignments were verified.

This reinforced the importance of understanding the distinction between authentication and authorization.

---

### Missing AI Reasoning Display

The application successfully extracted appointment priorities, but the user interface displayed:

```text id="wf06"
No reasoning provided
```

even when reasoning data existed.

#### Root Cause

The AI returned:

```text id="wf07"
reasoning
```

while the UI expected:

```text id="wf08"
aiReasoning
```

#### Resolution

Response mapping and UI handling logic were updated to ensure the correct fields were displayed.

---

## Key Lessons Learned

### 1. AI Extraction and Business Validation Should Remain Separate

AI is effective at interpreting natural language, while business rules should remain deterministic, predictable, and auditable.

### 2. Serverless Functions Provide Effective Workflow Isolation

Azure Functions offer a clean way to isolate validation logic and business workflows from application code.

### 3. Authorization Issues Often Resemble Authentication Problems

Many cloud identity challenges stem from insufficient permissions rather than failed authentication.

### 4. Deployment Pipelines Become More Important as Architectures Grow

As systems become more distributed, deployment workflows play a critical role in maintaining reliability and consistency.

### 5. AI Outputs Must Be Validated

AI-generated information should be treated as untrusted input and validated before influencing business processes.

---

## Outcome

By the end of this phase, the scheduling architecture evolved from:

```text id="wf09"
Receptionist
      │
      ▼
Azure OpenAI
      │
      ▼
Appointment Draft
      │
      ▼
Azure SQL Database
```

to:

```text id="wf10"
Receptionist
      │
      ▼
Azure OpenAI
      │
      ▼
Appointment Draft
      │
      ▼
Azure Function Validation
      │
      ▼
Human Review
      │
      ▼
Azure SQL Database
```

The platform became more modular, maintainable, and extensible.

The architecture is now positioned to support future capabilities such as:

* Scheduling conflict detection
* Doctor availability checks
* Office-hours validation
* Workflow automation
* Additional healthcare business rules

without increasing the complexity of the AI layer.

---

## Conclusion

Phase 5 introduced a dedicated serverless validation layer that separates AI-generated appointment extraction from business rule enforcement.

By implementing Azure Functions, extending the existing security model with Managed Identity and Key Vault integration, and integrating validation directly into the scheduling workflow, the platform gained a more scalable and maintainable architecture.

This phase established the foundation for future workflow automation and healthcare-specific scheduling intelligence while ensuring that AI-assisted decisions remain subject to validation and human oversight.
