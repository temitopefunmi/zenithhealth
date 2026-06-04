# Phase 1: Azure App Service Deployment and Runtime Challenges

## Overview

This phase marked my first experience deploying a modern Node.js application to Microsoft Azure.

The goal at this stage was not to build a healthcare platform. Instead, the objective was to learn how to deploy a web application to Azure App Service and automate deployments using GitHub Actions. I wanted to move beyond local development and gain practical experience with cloud application hosting, deployment automation, and runtime management.

The application used in this phase was based on a dashboard UI template, providing a realistic project for testing deployment workflows and cloud hosting concepts.

---

## Project State Before Deployment

Before beginning this phase:

* The application existed only on my local machine.
* No Azure resources had been provisioned.
* No deployment pipeline had been created.
* No infrastructure automation was in place.
* No database integration existed.
* No healthcare-specific functionality had been implemented.

At this point, the project was simply a standard Node.js web application.

---

## What Was Implemented

To deploy the application to Azure, I completed the following tasks:

* Created an Azure App Service instance.
* Configured the application for cloud deployment.
* Connected the GitHub repository to Azure.
* Built a GitHub Actions CI/CD pipeline.
* Automated deployments from GitHub to Azure App Service.

This phase introduced several important cloud concepts, including:

* Continuous Integration and Continuous Deployment (CI/CD)
* Build and release pipelines
* Environment configuration
* Application startup behavior
* Managed runtime environments
* Cloud application operations

---

## Why Azure App Service?

Azure App Service provided a straightforward way to learn cloud application deployment without the overhead of managing infrastructure.

Using App Service allowed me to focus on:

* Application deployment
* CI/CD workflows
* Runtime configuration
* Cloud-hosted application behavior

while avoiding the complexity of managing:

* Virtual machines
* Operating system maintenance
* Networking infrastructure
* Container orchestration platforms

This made it an ideal platform for learning deployment fundamentals.

---

## Why GitHub Actions?

I wanted deployments to occur automatically whenever code changes were pushed to the repository rather than relying on manual uploads.

GitHub Actions provided:

* Native integration with source control
* Automated build processes
* Automated deployments
* Repeatable deployment workflows

This was my first step toward implementing deployment automation and DevOps practices.

---

## Challenges Encountered

### Node.js Runtime Compatibility

The dashboard template was originally built using Node.js 22.

While the application ran successfully in the local development environment, issues appeared after deployment to Azure App Service. The application did not behave as expected, creating the first significant technical challenge of the project.

Initially, I assumed that if an application worked locally, it should also work in the cloud. This deployment experience demonstrated that local and cloud environments can behave differently, particularly when runtime versions and platform support are involved.

---

## Root Cause Analysis

After troubleshooting the deployment, the issue was traced to runtime compatibility and deployment behavior related to Node.js 22.

Although the application functioned correctly during local development, the deployment configuration and Azure runtime environment did not align cleanly with the application's requirements.

Rather than continuing to troubleshoot an unstable deployment, I chose to prioritize platform stability and proceed with a supported runtime version.

---

## Resolution

The solution was to downgrade the application runtime from:

* Node.js 22

to:

* Node.js 20

After migrating to Node.js 20, the deployment stabilized and the application ran successfully on Azure App Service.

With the deployment issues resolved, I continued experimenting with the application, making small UI modifications and becoming more familiar with the deployment workflow and Azure hosting environment.

---

## Key Lessons Learned

### 1. Local Success Does Not Guarantee Cloud Success

Cloud environments introduce constraints and dependencies that may not exist in local development environments.

An application that runs perfectly on a developer workstation may encounter issues when deployed to a managed cloud platform.

### 2. Runtime Versions Matter

When deploying applications to managed services, it is important to verify:

* Runtime support
* Platform compatibility
* Deployment requirements

rather than assuming the latest runtime version will always be the best choice.

### 3. CI/CD Automates Deployment, Not Troubleshooting

Automation makes deployments faster and more consistent, but it does not eliminate deployment issues.

Instead, CI/CD pipelines help surface problems earlier and provide a repeatable process for testing fixes.

### 4. Deployment Engineering Is Its Own Skill Set

Building an application and operating an application in the cloud require different areas of expertise.

This project began as a simple deployment exercise but quickly introduced broader topics such as:

* Cloud infrastructure
* Deployment reliability
* Automation
* Environment management
* Platform compatibility

Understanding these concepts became just as important as writing the application code itself.

---

## Conclusion

This phase established the foundation for everything that followed in the project.

What started as a straightforward exercise in deploying a Node.js application evolved into a practical introduction to cloud operations, deployment automation, and runtime management. The lessons learned during this stage influenced future architectural decisions and provided the confidence to continue building more advanced Azure-based solutions.
