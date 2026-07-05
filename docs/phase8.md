# Phase 8: Role-Aware AI Assistant for Healthcare Operations

## Overview

In this phase, I introduced an AI-powered assistant to the Zenith Health Portal using Azure OpenAI.

The objective was not to build a general-purpose chatbot, but rather to create a role-aware healthcare assistant capable of understanding natural language requests and translating them into authorized actions within the application.

The primary objectives were to:

* Implement role-aware prompt engineering
* Extract user intents from natural language
* Enforce role-based AI permissions
* Execute application actions from AI requests
* Capability-based intent execution
* Support shared intents with role-specific responses
* Improve dashboard usability through natural language interactions

This phase marked the transition from a traditional dashboard application into an AI-assisted healthcare operations platform.

---

# Architecture

```text
                     User Request
                           |
                           v
                  AI Command Bar (UI)
                           |
                           v
                /api/ai/process (Azure OpenAI)
                           |
                           |
                 Intent Extraction 
                           |
                           v
                   Structured JSON Output
                           |
                           v
                  /api/ai/execute
                           |
                           v
                 Intent Authorization Layer
                           |
                           v
                  Capability Router
                           |
                           v
                 Intent Executors
                           |
                           v                                                                      
                           |
            +--------------+--------------+
            |              |              |
            v              v              v

      Admin Actions   Doctor Actions   Nurse Actions
            |              |              |
            +--------------+--------------+
                           |
                           v

                      SQL retrieval
                           |
                           v
                 Context Generation (Azure OpenAI)
                           |
                           v
                  Structured Response
                           |
                           v 
                     AI Command Bar      
```

---

# AI Command Bar

A new AI Command Bar was introduced to provide a natural language interface to the platform.

Users can interact with the system by typing requests such as:

Administrator

* Show pending reviews
* Show Dr Amina Bello's appointments
* How many appointments today?

Doctor

* Show my appointments today
* Show my appointments this week
* Show my assigned patients

Nurse

* Show today's queue
* Show waiting patients

The AI assistant interprets the request and converts it into structured actions inside the application.

The AI layer was designed using a capability-based architecture.

Rather than placing all AI logic inside a single service, intents are grouped into capability modules such as:

- appointments
- clinical
- nursing
- operations
- patients

This approach improves maintainability and provides a natural path toward future service decomposition and containerization.

---

# Role-Aware Prompt Engineering

A dedicated system prompt was created for each application role:

* ADMIN
* DOCTOR
* NURSE

Each role receives:

* Different intents
* Different capabilities
* Different examples
* Different parameter extraction rules

This ensures that the same request can produce different outcomes depending on the authenticated user.

For example:

```text
Show appointments
```

For a Doctor:

```text
Show my appointments
```

For an Administrator:

```text
Please specify which doctor's appointments you would like to view.
```

This creates a more realistic and secure healthcare AI experience.

---

# Intent Extraction

Azure OpenAI is responsible for converting natural language into structured JSON.

Example:

User:

```text
Show Dr Amina Bello's appointments today
```

AI Output:

```json
{
  "intent": "viewAppointments",
  "parameters": {
    "scope": "doctor",
    "doctorName": "Dr Amina Bello",
    "timeRange": "today"
  },
  "summary": "Administrator wants appointment statistics for Dr Amina Bello today."
}
```

This structured output becomes the contract between the AI model and the application.

---

# Intent Authorization

An authorization layer was introduced to ensure users can only execute actions permitted for their role.

```text
ADMIN
 ├── viewStatistics
 ├── viewAppointments
 ├── searchPatient
 └── generateReport

DOCTOR
 ├── viewAppointments
 ├── viewAssignedPatients
 ├── summarizePatientHistory
 └── showPatientVitals

NURSE
 ├── showTodaysQueue
 ├── showWaitingPatients
 ├── recordVitals
 └── bookAppointment
```

This prevents AI-generated requests from bypassing application security.

Even if the model incorrectly extracts an intent, the authorization layer still protects the application.

---

# Shared Intents with Scoped Responses

A major design challenge involved handling intents that should exist across multiple roles.

For example:

```text
viewAppointments
```

can mean different things.

Administrator:

```text
Show Dr Amina Bello's appointments.
```

Returns:

* Appointment counts
* Completed appointments
* Pending appointments
* Scheduled appointments

Doctor:

```text
Show my appointments.
```

Returns:

* Patient list
* Appointment dates
* Appointment types
* Appointment status

Although the intent is the same, the returned data is entirely different.

This approach more closely mirrors real-world enterprise applications where permissions often influence the scope of data returned rather than simply allowing or denying access.

---

# Intent Executor Service

A dedicated Intent Executor service was implemented to separate AI interpretation from business logic.

Responsibilities include:

* Executing database queries
* Returning structured responses
* Enforcing role-specific behavior
* Supporting future extensibility

The executor currently supports:

* viewAppointments
* viewAssignedPatients
* showTodaysQueue
* showPendingReviews
* viewStatistics

Additional capabilities can be added without changing the AI integration itself.

---

# Structured Retrieval AI

The platform now supports Structured Retrieval AI.

Instead of allowing the language model direct database access, the application:

1. Executes authorized SQL queries.
2. Builds contextual prompts from retrieved data.
3. Uses Azure OpenAI to generate summaries and recommendations.

Architecture:

User Request
↓
Intent
↓
SQL Retrieval
↓
Context Assembly
↓
Azure OpenAI
↓
Response

This pattern is a form of Retrieval-Augmented Generation (RAG) using structured data rather than vector search.

---

# Structured Result Rendering

The AI assistant was enhanced to render application-specific responses instead of raw JSON.

Examples include:

* Statistics cards
* Appointment tables
* Patient lists
* Pending review tables
* Informational messages

This significantly improves the user experience and makes the AI assistant feel like a natural extension of the application rather than a standalone chatbot.

---

# Dynamic Date Interpretation

The AI assistant was enhanced to understand relative date expressions.

Examples:

```text
today
this week
this month
tomorrow
```

When no date range is specified:

Doctor:

```text
Show my appointments
```

Defaults to:

```text
Upcoming appointments
```

Administrator:

```text
Show Dr Amina Bello's appointments
```

Defaults to:

```text
Upcoming appointment statistics
```

This behavior creates a more natural user experience.

---

# Improving Demo Data Realism

As the AI assistant became more capable, unrealistic seed data became more noticeable.

The demo data generation process was updated to better reflect real-world healthcare operations.

Examples:

Past appointments:

* Completed
* Pending
* Cancelled

Today's appointments:

* Scheduled
* Pending
* Completed
* Cancelled

Future appointments:

* Scheduled
* Pending
* Cancelled

Future appointments are no longer incorrectly marked as completed.

Medication administration and prescription data were also updated to better align with appointment timing.

---

# Preparing for Retrieval-Augmented Generation (RAG)

The architecture introduced during this phase establishes the foundation for future AI capabilities.

Potential future enhancements include:

* Patient note summarization
* Clinical document search
* Hospital policy search
* Semantic search
* Retrieval-Augmented Generation (RAG)
* AI-powered operational recommendations

The current intent-based system provides a strong foundation for introducing these more advanced capabilities.

---

# Challenges Encountered

During implementation, several practical challenges were encountered:

* Designing role-aware AI prompts
* Preventing AI from generating unauthorized actions
* Handling shared intents across roles
* Determining when administrators should receive aggregated data versus detailed data
* Creating structured result rendering instead of displaying raw JSON
* Improving demo data realism for AI interactions
* Designing an extensible architecture for future AI capabilities

These challenges provided deeper insight into how AI systems must be combined with traditional authorization and business logic to create secure enterprise applications.

---

# Lessons Learned

- AI integrations require careful prompt design.
- Role-based authorization should be enforced outside the model.
- Structured retrieval can provide significant value before introducing vector databases and semantic search.
- Prompt size and token limits can significantly affect application behavior.
- AI services should be designed with future extensibility in mind.

# Conclusion

At the end of this phase:

* Azure OpenAI has been integrated into the platform
* Natural language requests can be converted into structured intents
* AI interactions are constrained by application roles
* Intent authorization has been implemented
* Shared intents support role-specific responses
* Structured UI rendering has replaced raw JSON output
* Realistic healthcare workflows can now be executed through natural language
* The foundation for Retrieval-Augmented Generation (RAG) and semantic search has been established

This phase transformed Zenith Health Portal from a role-based healthcare application into an AI-assisted healthcare operations platform capable of understanding and executing natural language requests securely and contextually.



## Development Note: Azure OpenAI Rate Limits During Local Development

The Azure OpenAI deployment used during development was configured with a very small quota (1 request per minute and 1000 tokens per minute). Since the AI copilot workflow requires two model calls:

1. Intent classification
2. Response generation (for example, patient summaries)

the second request could be rejected with an HTTP 429 (Too Many Requests) error during testing.

To continue developing and testing individual AI capabilities, intent classification was temporarily bypassed by hardcoding the intended action and parameters. This allowed the feature under development to be tested with a single model request.

Example:

```js
const aiResponse = {
  intent: "summarizePatientHistory",
  parameters: {
    patientName: "John Doe"
  }
};
```

This workaround was used only during development and should be removed once sufficient Azure OpenAI quota is available or separate deployments are configured for intent classification and response generation.
