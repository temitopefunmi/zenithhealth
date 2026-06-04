# Phase 2: Moving from Portal Clicks to Infrastructure as Code with Terraform

## Overview

During Phase 1, I stabilized the application by downgrading from Node.js 22 to Node.js 20 after encountering runtime compatibility issues on Azure App Service.

While this workaround allowed development to continue, it was never intended to be a long-term solution. Eventually, Microsoft announced the end of support for Node.js 20, making it necessary to revisit both the application's runtime strategy and deployment architecture.

As I prepared for the upgrade, a larger concern became apparent: much of the infrastructure existed only as manual Azure Portal configuration.

This raised an important question:

> If I needed to rebuild the environment from scratch, could I do it reliably and consistently?

The answer was no.

This realization marked the beginning of a transition from manually managed cloud resources to Infrastructure as Code (IaC) using Terraform.

---

## Project State Before the Migration

At the start of this phase:

* Azure resources had been created manually through the Azure Portal.
* GitHub Actions was already handling application deployments.
* The application was running successfully on Azure App Service.
* Infrastructure configuration existed primarily inside Azure rather than in source control.

Although the application was operational, several concerns emerged:

* Infrastructure could not be recreated easily.
* Configuration was scattered across multiple Azure services.
* Environment setup relied on manual documentation.
* Future upgrades would become increasingly difficult to manage.
* Infrastructure drift could occur over time.

The system worked, but it lacked reproducibility.

---

## Challenge 1: Upgrading Back to Node.js 22

The first challenge appeared when upgrading the application from Node.js 20 back to Node.js 22.

Several dependencies within the dashboard template were not fully compatible with the newer runtime. Package installation began producing dependency conflicts and build failures.

Resolving the migration required:

* Removing existing dependency artifacts.
* Rebuilding dependency trees.
* Updating selected packages.
* Handling legacy peer dependency conflicts.

One of the most problematic dependencies was:

```text
node-sass
```

Because the library relied on native compilation, it introduced compatibility issues with the newer runtime environment.

After investigating the problem, I removed the dependency and transitioned to modern Sass tooling, eliminating the compatibility issues and simplifying future maintenance.

### Lesson Learned

Runtime upgrades are rarely just runtime upgrades.

They often reveal technical debt hidden within application dependencies and build processes.

---

## Challenge 2: Moving Infrastructure into Code

While working through the runtime migration, I realized that manually configured Azure resources created several operational risks:

* Undocumented infrastructure
* Difficult environment recreation
* Configuration drift
* Inconsistent deployments

The solution was to adopt Terraform and define the environment as code.

The goal was simple:

> If the environment needed to be recreated, it should be possible to do so entirely from source control.

Terraform configurations were created for core infrastructure components, including:

* Resource Groups
* App Service Plans
* Azure Web Apps
* Supporting Azure resources

Infrastructure was no longer managed through Azure Portal clicks alone. It became version-controlled, reviewable, and reproducible.

### Lesson Learned

Infrastructure is part of the application.

If it cannot be recreated from code, it becomes increasingly difficult to maintain and scale.

---

## Challenge 3: Rebuilding the Deployment Pipeline

The original deployment workflow was relatively straightforward. It focused primarily on deploying application code to an already existing Azure environment.

With Terraform introduced into the project, the deployment process needed to evolve.

The GitHub Actions workflow was redesigned to:

* Initialize Terraform
* Provision infrastructure
* Cache application dependencies
* Build the application
* Package deployment artifacts
* Deploy the application to Azure

The pipeline became responsible for both infrastructure provisioning and application delivery.

### Lesson Learned

As systems evolve, deployment pipelines become products in their own right.

Maintaining a reliable pipeline becomes just as important as maintaining the application itself.

---

## Challenge 4: The Cloud Reality Check

After completing the migration work, everything appeared successful during local testing.

* The application built successfully.
* The dashboard loaded correctly.
* Deployment artifacts were generated without issues.

I expected deployment to Azure to be straightforward.

It was not.

After deployment, Azure App Service displayed the dreaded:

```text
Application Error
```

Investigating the logs revealed that Azure was repeatedly attempting to resolve dependencies at runtime, creating instability and exhausting the limits of the App Service free tier.

This became one of the most valuable lessons of the project.

A successful local environment does not guarantee a successful cloud deployment.

---

## Root Cause Analysis

The problem was not caused by the application code itself.

Instead, it was caused by how the application was packaged and started inside Azure App Service.

The deployment strategy needed to be optimized for cloud execution rather than local development.

---

## Solution: Standalone Builds and Explicit Startup Commands

The final solution involved changes to both the application and the infrastructure configuration.

### Application Changes

The Next.js application was configured to generate a standalone production build:

```javascript
output: "standalone";
```

This created a self-contained deployment package optimized for cloud environments and reduced Azure's need to resolve dependencies during startup.

### Infrastructure Changes

Azure App Service was configured through Terraform to start the application using an explicit startup command:

```bash
node server.js
```

By defining the startup behavior directly, Azure could launch the application consistently without relying on runtime detection mechanisms.

The combination of standalone packaging and explicit startup configuration finally produced a stable Node.js 22 deployment on Azure App Service.

---

## Key Lessons Learned

### 1. Cloud Deployments Expose Hidden Problems

Issues that remain invisible during local development often become apparent when applications are deployed to production environments.

### 2. Infrastructure Should Be Treated as Code

Version-controlled infrastructure improves reproducibility, consistency, and long-term maintainability.

### 3. CI/CD Pipelines Must Evolve with the Architecture

As infrastructure and application complexity grow, deployment workflows must adapt to support new requirements.

### 4. Application Packaging Matters

Deployment success depends not only on application code but also on how the application is packaged and executed in the target environment.

### 5. Cloud Engineering Requires a Systems Perspective

Successful cloud deployments require understanding the interaction between:

* Application code
* Infrastructure
* Deployment pipelines
* Runtime environments

Focusing on only one layer is rarely enough to solve production issues.

---

## Conclusion

This phase represented a major shift in the project's evolution.

What began as a simple deployment exercise matured into a cloud engineering project focused on reproducibility, automation, and operational reliability.

By introducing Terraform, modernizing the deployment pipeline, and successfully migrating back to Node.js 22, the project moved beyond basic hosting and toward a more sustainable cloud architecture.

This foundation would support future enhancements and set the stage for transforming the application into the broader Zenith HealthTech platform envisioned in later phases.
