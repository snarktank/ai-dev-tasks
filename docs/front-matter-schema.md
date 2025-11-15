# Front Matter Schema

This document defines the YAML front matter metadata schema for generated documents (PRDs and task lists) in the AI Dev Tasks workflow.

## Purpose

Front matter provides structured metadata that enables:
- **Traceability**: Track who created documents, when, and with which AI model
- **Versioning**: Document evolution over time with changelog
- **Organization**: Better searchability and categorization in tools like Obsidian
- **Standards**: Align with documentation best practices (e.g., Good Laboratory Practice)

## Schema Definition

### Required Fields

All generated documents MUST include these fields:

```yaml
---
doc_type: string          # "prd" or "task-list"
id: string                # Unique identifier (e.g., "prd-20250115-user-auth")
slug: string              # URL-friendly identifier matching filename
version: string           # Semantic version (e.g., "1.0.0")
created_at: string        # ISO 8601 datetime (e.g., "2025-01-15T10:30:00Z")
author:
  name: string            # Name of the person who created/requested the document
  ai_model: string        # AI model used (e.g., "Claude Sonnet 4.5")
---
```

### Optional Fields

Documents MAY include these fields for enhanced metadata:

```yaml
---
# ... required fields above ...

title: string                    # Human-readable title
description: string              # Brief description of the document
language: string                 # Programming language (e.g., "python", "typescript", "go")
project: string                  # Project name this document belongs to
tags: string[]                   # Array of tags for categorization
confidentiality: string          # "public", "internal", or "confidential"
related_docs:                    # Links to related documentation
  prd: string                    # Path to related PRD
  tasks: string                  # Path to related task list
  implementation: string         # Path to implementation notes
contributors: object[]           # Additional contributors
  - name: string
    role: string
    email: string
changelog: object[]              # Version history
  - version: string
    date: string                 # YYYY-MM-DD format
    changes: string              # Description of changes
---
```

## Field Descriptions

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `doc_type` | string | Type of document | `"prd"` or `"task-list"` |
| `id` | string | Unique identifier combining type, date, and slug | `"task-list-20250115-user-profile"` |
| `slug` | string | URL-friendly identifier, should match filename without extension | `"tasks-user-profile-editing"` |
| `version` | string | Semantic version following semver.org | `"1.0.0"`, `"1.2.3"` |
| `created_at` | string | ISO 8601 datetime in UTC | `"2025-01-15T10:30:00Z"` |
| `author.name` | string | Name of document creator/requester | `"Jane Developer"` |
| `author.ai_model` | string | AI model used for generation | `"Claude Sonnet 4.5"`, `"GPT-4"` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | string | Human-readable title | `"User Profile Editing Feature"` |
| `description` | string | Brief summary (1-2 sentences) | `"Implementation tasks for user profile editing"` |
| `language` | string | Primary programming language | `"python"`, `"typescript"`, `"go"` |
| `project` | string | Project name | `"MyApp"`, `"E-commerce Platform"` |
| `tags` | array | Categorization tags | `["feature", "user-management", "frontend"]` |
| `confidentiality` | string | Access level | `"public"`, `"internal"`, `"confidential"` |
| `related_docs` | object | Links to related files | See examples below |
| `contributors` | array | Additional contributors | See examples below |
| `changelog` | array | Version history | See examples below |

## Complete Examples

### Example 1: PRD with Minimal Required Fields

```yaml
---
doc_type: "prd"
id: "prd-20250115-user-authentication"
slug: "prd-user-authentication"
version: "1.0.0"
created_at: "2025-01-15T10:30:00Z"
author:
  name: "Jane Developer"
  ai_model: "Claude Sonnet 4.5"
---
```

### Example 2: Task List with Full Metadata

```yaml
---
doc_type: "task-list"
id: "task-list-20250115-user-profile-editing"
slug: "tasks-user-profile-editing"
version: "1.2.0"
created_at: "2025-01-15T10:30:00Z"
author:
  name: "Jane Developer"
  ai_model: "Claude Sonnet 4.5"
title: "User Profile Editing Implementation Tasks"
description: "Detailed task breakdown for implementing user profile editing feature with validation and image upload"
language: "python"
project: "MyApp Backend"
tags: ["feature", "user-management", "backend", "api"]
confidentiality: "internal"
related_docs:
  prd: "/tasks/prd-user-profile-editing.md"
  implementation: "/docs/user-profile-implementation.md"
contributors:
  - name: "John Reviewer"
    role: "Tech Lead"
    email: "john@example.com"
changelog:
  - version: "1.2.0"
    date: "2025-01-16"
    changes: "Added image upload validation tasks based on code review feedback"
  - version: "1.1.0"
    date: "2025-01-15"
    changes: "Added API endpoint tasks for profile updates"
  - version: "1.0.0"
    date: "2025-01-15"
    changes: "Initial task list created"
---
```

### Example 3: PRD with Comprehensive Metadata

```yaml
---
doc_type: "prd"
id: "prd-20250115-payment-integration"
slug: "prd-payment-integration"
version: "2.0.0"
created_at: "2025-01-15T09:00:00Z"
author:
  name: "Product Team"
  ai_model: "Claude Sonnet 4.5"
title: "Third-Party Payment Gateway Integration"
description: "Requirements for integrating Stripe payment processing into the e-commerce platform"
language: "typescript"
project: "E-commerce Platform"
tags: ["feature", "payments", "integration", "security"]
confidentiality: "internal"
related_docs:
  tasks: "/tasks/tasks-payment-integration.md"
  implementation: "/docs/payment-gateway-design.md"
contributors:
  - name: "Alice Security"
    role: "Security Reviewer"
    email: "alice@example.com"
  - name: "Bob Finance"
    role: "Finance Lead"
    email: "bob@example.com"
changelog:
  - version: "2.0.0"
    date: "2025-01-15"
    changes: "Updated to use Stripe Payment Intents API instead of deprecated Charges API"
  - version: "1.1.0"
    date: "2025-01-10"
    changes: "Added security requirements based on security review"
  - version: "1.0.0"
    date: "2025-01-08"
    changes: "Initial PRD created"
---
```

## Best Practices

### ID Generation

Generate unique IDs using this pattern:
```
[doc_type]-[YYYYMMDD]-[short-slug]
```

Examples:
- `prd-20250115-user-auth`
- `task-list-20250115-profile-edit`

### Version Management

Follow semantic versioning (semver.org):
- **Major** (x.0.0): Significant restructuring or scope changes
- **Minor** (0.x.0): Adding new sections or requirements
- **Patch** (0.0.x): Small corrections, typos, clarifications

### Changelog Guidelines

- Record all meaningful changes
- Use present tense: "Add feature X" not "Added feature X"
- Be specific about what changed
- Include date in YYYY-MM-DD format
- Most recent version at the top

### Language Field Values

Use lowercase, standardized language names:
- `"typescript"` (covers JavaScript too)
- `"python"`
- `"go"`
- `"java"`
- `"rust"`
- `"csharp"`
- `"ruby"`
- `"php"`

### Tags Guidelines

Use consistent, descriptive tags:
- Feature type: `feature`, `bugfix`, `refactor`, `enhancement`
- Domain: `frontend`, `backend`, `api`, `database`, `ui`
- Category: `user-management`, `payments`, `auth`, `reporting`
- Priority: `urgent`, `high-priority`, `nice-to-have`

## Integration with AI Workflow

### For AI Assistants

When generating PRDs or task lists:

1. **Always include front matter** at the very top of the document
2. **Populate all required fields** with appropriate values
3. **Use current timestamp** for `created_at` field
4. **Detect language** from context and include in optional `language` field
5. **Start with version 1.0.0** for new documents
6. **Ask user for name** to populate `author.name` if not in context

### For Users

When requesting document generation:

- Provide your name for the `author.name` field
- Specify project name if you want it included
- Mention if document should be confidential or internal
- Request specific tags if you have a tagging system

## Tools Integration

### Obsidian

Front matter enables:
- Search by tags, language, or project
- Filter by doc_type or confidentiality
- Create dataview queries for document management
- Build graphs of related documents

### Other Tools

Compatible with:
- Jekyll/Hugo static site generators
- Markdown processors that support YAML front matter
- Documentation management systems
- Knowledge base tools (Notion, Roam, etc.)

## Validation

### Required Field Check

Before saving a document, verify:
- [ ] All required fields are present
- [ ] `doc_type` is either "prd" or "task-list"
- [ ] `version` follows semver format
- [ ] `created_at` is valid ISO 8601 datetime
- [ ] `slug` matches filename (without extension)

### Optional Field Check

If including optional fields:
- [ ] `language` matches supported language from `lang/` directory
- [ ] `tags` is an array, not a string
- [ ] `changelog` entries are in reverse chronological order
- [ ] Related document paths are valid

## Future Extensions

Potential additions to the schema:
- `status`: "draft", "review", "approved", "implemented"
- `priority`: "low", "medium", "high", "critical"
- `estimated_effort`: Time estimation for task completion
- `dependencies`: Links to prerequisite documents or tasks
- `assigned_to`: Person responsible for implementation
