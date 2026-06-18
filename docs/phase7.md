# Phase 7: Role-Based Healthcare Operations Platform

## Overview

In this phase, Zenith Health Portal evolved from an authenticated application into a role-based healthcare operations platform.

With Microsoft Entra ID authentication and application roles already established, the focus shifted to delivering role-specific experiences for administrators, doctors, and nurses.

The primary objectives were to:

* Implement role-aware dashboard experiences
* Connect dashboards to Azure SQL-backed healthcare data
* Model realistic healthcare workflows
* Establish relationships between clinical and operational records
* Build the foundation for role-based AI interactions

By the end of this phase, users were no longer presented with generic application views. Instead, each role received information and functionality relevant to their responsibilities within the healthcare environment.

---

# Architecture

```text
                    +----------------------+
                    | Microsoft Entra ID   |
                    +----------+-----------+
                               |
                         Authentication
                               |
                               v

                     Zenith Health Portal
                               |
                          NextAuth.js
                               |
                     Session Role Mapping
                               |
              +----------------+----------------+
              |                |                |
              v                v                v

      Admin Dashboard   Doctor Dashboard   Nurse Dashboard
              |                |                |
              +----------------+----------------+
                               |
                               v

                         Azure SQL Database
```

---

# Healthcare Data Model

To support realistic healthcare workflows, multiple related datasets were introduced.

The central entity is the Appointment record, which serves as the anchor point for clinical and operational activities.

```text
Appointments
     |
     +-- Clinical Notes
     |
     +-- Prescriptions
     |
     +-- Vitals
     |
     +-- Medication Administration
     |
     +-- Nurse Assignments
```

This structure enables different healthcare roles to interact with the same patient encounter while maintaining role-appropriate responsibilities.

---

# Doctor Dashboard

The Doctor Dashboard was designed around clinical decision-making and patient care.

Key capabilities include:

* Upcoming appointments
* Patient records
* Clinical note management
* Prescription review
* Appointment verification

Doctors primarily interact with clinical information and are responsible for reviewing and validating patient encounters.

Role-based routing ensures that doctors only access functionality relevant to clinical practice.

---

# Nurse Dashboard

The Nurse Dashboard focuses on operational patient care activities.

Features include:

* Patient care queue
* Vital sign monitoring
* Medication administration tracking
* Nurse assignment management
* Ward-level operational visibility

Nurses interact with patient care workflows rather than administrative reporting or physician-specific functions.

This creates a more realistic separation of responsibilities across the platform.

---

# Administrator Dashboard

The Administrator Dashboard provides operational visibility across the healthcare environment.

Implemented capabilities include:

* Appointment metrics
* High-priority case monitoring
* Pending review tracking
* Staff management
* Patient distribution reporting

The dashboard aggregates information from multiple areas of the system to support operational decision-making.

Unlike clinical users, administrators focus on workload management, staffing visibility, and organizational performance.

---

# Patient Classification

To better reflect real-world healthcare operations, patient encounters were categorized into:

* Outpatient
* Inpatient
* Emergency

This classification enables more meaningful operational reporting and supports future workflow automation.

Patient categories are used throughout the platform to provide administrative insights and workload visibility.

---

# Realistic Clinical Relationships

A significant focus during this phase was establishing realistic relationships between healthcare records.

Examples include:

* Doctors create clinical notes associated with appointments
* Prescriptions are linked to patient encounters
* Nurses record vital signs for assigned patients
* Medication administration records reference prescribed treatments
* Nurse assignments connect staff members to operational workloads

These relationships create a more accurate representation of how healthcare teams collaborate around patient care.

---

# Preparing for Role-Based AI

The introduction of role-specific workflows establishes the foundation for permission-aware AI capabilities.

Future AI interactions can be constrained according to the authenticated user's role.

Examples include:

Administrator

* Operational reporting assistance
* Resource planning recommendations
* Workforce management insights

Doctor

* Clinical workflow support
* Appointment preparation assistance
* Documentation assistance

Nurse

* Care coordination assistance
* Task prioritization support
* Operational workflow guidance

The platform architecture now supports role-aware AI experiences without exposing identical capabilities to every user.

---

# Challenges Encountered

During implementation, several practical challenges were encountered:

* Designing realistic healthcare data relationships
* Modeling interactions between doctors, nurses, and administrators
* Building role-aware dashboard experiences
* Connecting dashboard components to live Azure SQL data
* Creating meaningful healthcare operational metrics
* Separating clinical workflows from administrative workflows
* Preparing data structures for future AI integration

These challenges provided deeper insight into healthcare application architecture and role-based system design.

---

# Conclusion

At the end of this phase:

* Role-aware dashboards are operational
* Administrators, doctors, and nurses receive tailored experiences
* Healthcare workflows are modeled using realistic data relationships
* Azure SQL serves as the operational data store
* Clinical and operational records are connected through appointment-based workflows
* Patient classification has been implemented
* The foundation for role-based AI interactions has been established

This phase transformed Zenith Health Portal from an authenticated application into a role-aware healthcare operations platform capable of supporting both clinical and administrative workflows.
