---
description: Guidelines for generating a Technical Design Document (TDD) from a Product Requirements Document (PRD).
globs:
alwaysApply: false
---
# Rule: Generating a Technical Design Document (TDD)

## Goal

To guide an AI assistant in creating a detailed Technical Design Document (TDD) in Markdown format. The TDD will be based on an existing Product Requirements Document (PRD) and will outline the technical approach for implementing a feature. It serves as a bridge between the "what" and "why" (PRD) and the "how-to-implement" (task list).

## Context

The TDD should be generated *after* a PRD for a feature has been finalized, and *before* a detailed task list for implementation is created. This ensures that product requirements are clear before technical planning begins, and technical planning is established before breaking work into granular tasks.

## Process

1.  **Receive PRD Reference:** The user provides a reference to a finalized PRD file (e.g., `prd-[feature-name].md`).
2.  **Analyze PRD:** The AI thoroughly reads and understands the specified PRD, focusing on functional requirements, user stories, success metrics, and any existing design or technical considerations.
3.  **Ask Clarifying Technical Questions (If Necessary):** Before drafting the TDD, if the PRD lacks sufficient detail for technical planning or if ambiguities exist regarding the technical implementation, the AI *should* ask clarifying questions. The goal is to solidify the "how."
4.  **Generate TDD:** Based on the PRD and any answers to clarifying questions, the AI generates the TDD using the structure outlined below.
5.  **Save TDD:** Save the generated document as `tdd-[prd-file-name].md` inside the `/tasks` directory, where `[prd-file-name]` is the base name of the PRD file it's based on.

## Clarifying Technical Questions (Examples)

The AI should adapt its questions based on the PRD, but here are some common areas to explore for technical design:

* **System Architecture:** "Are there specific architectural patterns (e.g., microservices, event-driven) that should be followed or considered for this feature?" or "How is this feature expected to integrate with existing core services or modules (e.g., authentication, user service, payment gateway)?"
* **Data Model:** "What new database tables, collections, or documents will be needed? Can you outline their proposed schemas (fields, types, relationships)?" or "Will existing data models require modification? If so, which ones and how?"
* **API Design:** "Will new API endpoints be required? If so, what are their proposed methods, paths, request/response bodies, and authentication/authorization mechanisms?" or "Are there existing APIs that will be consumed or extended?"
* **Technology Stack & Libraries:** "Are there any preferred or mandated technologies, frameworks, or libraries for the backend and frontend (if applicable) implementation of this feature?" or "Are there any existing internal libraries or utilities that should be leveraged?"
* **Error Handling & Resilience:** "What are the key failure points or exceptional scenarios to consider, and what is the expected error handling behavior (e.g., retry mechanisms, fallback strategies, user notifications)?"
* **Security Considerations:** "Beyond general security practices, are there specific security vulnerabilities or requirements to address for this feature (e.g., data encryption at rest/transit for sensitive PII, specific input validation rules, rate limiting)?"
* **Performance & Scalability:** "Are there specific performance benchmarks (e.g., response time under X load, concurrent user capacity) or scalability requirements for this feature?"
* **Third-Party Integrations:** "Does this feature involve integration with any third-party services? If so, which ones, and are their APIs/SDKs understood?"
* **Logging & Monitoring:** "What specific events or metrics should be logged for debugging, monitoring, or auditing purposes related to this feature?"

## TDD Structure

The generated TDD should include the following sections:

1.  **Introduction & Purpose:**
    * Brief overview of the feature this TDD addresses.
    * Purpose of this document: to detail the technical design for implementation.
2.  **PRD Reference:**
    * Filename of the PRD this TDD is based on (e.g., `prd-[feature-name].md`).
3.  **Technical Overview & Architecture:**
    * High-level description of the proposed technical solution.
    * Key architectural decisions (e.g., choice of patterns, frameworks, major components).
    * Diagrams (if representable in Markdown/text, or describe where they would be).
4.  **Data Model Design:**
    * Details of new or modified database schemas, tables, fields, and relationships.
    * Data validation rules.
    * Data migration strategy, if applicable.
5.  **API Design (if applicable):**
    * List of new or modified API endpoints.
    * For each endpoint:
        * Method (GET, POST, PUT, DELETE, etc.).
        * Path.
        * Request parameters/body schema.
        * Response body schema (including error responses).
        * Authentication and authorization requirements.
6.  **Module/Component Breakdown:**
    * Identification of key new or significantly modified software modules, classes, or components.
    * Responsibilities of each component.
    * Interactions between components.
7.  **Integration with Existing Systems:**
    * How the new feature interacts with other parts of the application or external services.
    * Impact on existing systems.
8.  **Error Handling & Logging Strategy:**
    * Approach to handling expected and unexpected errors.
    * Key information to be logged and logging levels.
9.  **Security Considerations:**
    * Specific security measures to be implemented (e.g., input validation, output encoding, access controls, data protection).
    * Potential threats and mitigations.
10. **Performance & Scalability Considerations:**
    * Design choices made to meet performance or scalability requirements.
    * Expected load and data volumes.
11. **Testing Strategy Considerations:**
    * Outline of how the feature will be tested (e.g., key areas for unit tests, integration test points, considerations for E2E testing). This is not the full test plan but design considerations for testability.
12. **Technical Risks & Mitigation Plan:**
    * Identified potential technical challenges, unknowns, or dependencies.
    * Proposed strategies to mitigate these risks.
13. **Deployment Considerations (Optional):**
    * Any special steps or considerations for deploying this feature (e.g., environment variable changes, infrastructure adjustments, rollout plan).
14. **Out of Scope (Technical Non-Goals):**
    * Clearly list technical functionalities or approaches that are intentionally *not* part of this design to manage scope.
15. **Open Technical Questions:**
    * List any remaining technical questions or areas needing further investigation or decisions.

## Target Audience

The primary readers of the TDD are **developers** (including junior developers) who will implement the feature, as well as **tech leads** and **architects** who will review the technical design. The document should be detailed enough to guide implementation, yet clear and concise for effective review and understanding. Avoid excessive jargon where simpler terms suffice, or explain crucial technical terms if necessary.

## Output

* **Format:** Markdown (`.md`)
* **Location:** `/tasks/`
* **Filename:** `tdd-[prd-file-name].md` (e.g., if PRD is `prd-user-authentication.md`, the TDD filename should be `tdd-prd-user-authentication.md`).

## Final Instructions

1.  The AI should prioritize eliciting sufficient technical detail through clarifying questions if the PRD is not technically explicit enough for design.
2.  The TDD should be grounded in the requirements of the referenced PRD.
3.  The aim is to create a practical document that aids development, rather than a purely theoretical one.