# Rule: Generating a Task List from User Requirements

## 🎯 Language Configuration (AI Instructions)

**CRITICAL - READ THIS FIRST:**

Before generating tasks, you MUST:

1. **Detect the programming language** from:
   - Explicit mention in user's request ("for my Python project")
   - Language specified in the PRD
   - File extensions in the repository (`.py`, `.ts`, `.go`, etc.)
   - Ask the user if unclear

2. **Read the language configuration file**:
   - TypeScript/JavaScript → `@lang/typescript.md`
   - Python → `@lang/python.md`
   - Go → `@lang/go.md`
   - See `lang/README.md` for all supported languages

3. **Confirm to the user** which language configuration you're using:
   ```
   "I will generate tasks for [LANGUAGE] using these conventions:
   - File extension: [extension]
   - Test command: [command]
   - Test location: [pattern]"
   ```

This confirmation ensures you've loaded the correct language-specific conventions before proceeding.

**Fallback**: If automatic detection fails, the user can explicitly reference both files:
```
@generate-tasks.md @lang/python.md [their request]
```

---

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format based on user requirements, feature requests, or existing documentation. The task list should guide a developer through implementation.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[feature-name].md` (e.g., `tasks-user-profile-editing.md`)

## Process

1.  **Receive Requirements:** The user provides a feature request, task description, or points to existing documentation
2.  **Analyze Requirements:** The AI analyzes the functional requirements, user needs, and implementation scope from the provided information
3.  **Phase 1: Generate Parent Tasks:** Based on the requirements analysis, create the file and generate the main, high-level tasks required to implement the feature. **IMPORTANT: Always include task 0.0 "Create feature branch" as the first task, unless the user specifically requests not to create a branch.** Use your judgement on how many additional high-level tasks to use. It's likely to be about 5. Present these tasks to the user in the specified format (without sub-tasks yet). Inform the user: "I have generated the high-level tasks based on your requirements. Ready to generate the sub-tasks? Respond with 'Go' to proceed."
4.  **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
5.  **Phase 2: Generate Sub-Tasks:** Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete the parent task. Ensure sub-tasks logically follow from the parent task and cover the implementation details implied by the requirements.
6.  **Identify Relevant Files:** Based on the tasks and requirements, identify potential files that will need to be created or modified. List these under the `Relevant Files` section. **Use the file extensions, test file patterns, and directory structures from the language configuration file you loaded.**
7.  **Generate Final Output:** Combine the parent tasks, sub-tasks, relevant files, and notes into the final Markdown structure.
8.  **Save Task List:** Save the generated document in the `/tasks/` directory with the filename `tasks-[feature-name].md`, where `[feature-name]` describes the main feature or task being implemented (e.g., if the request was about user profile editing, the output is `tasks-user-profile-editing.md`).

## Output Format

The generated task list _must_ follow this structure, including YAML front matter at the top:

````markdown
---
doc_type: "task-list"
id: "task-list-[YYYYMMDD]-[short-slug]"
slug: "[feature-name]"
version: "1.0.0"
created_at: "[ISO-8601-datetime]"
author:
  name: "[User's name or 'User']"
  ai_model: "[Your model name, e.g., 'Claude Sonnet 4.5']"
title: "[Human-readable feature title]"
description: "[Brief 1-2 sentence description]"
language: "[Programming language from lang config]"
tags: ["feature", "[category]", "[domain]"]
---

# [Feature Name] - Implementation Tasks

## Relevant Files

- `path/to/file[.ext]` - Brief description of why this file is relevant (e.g., Contains the main component for this feature)
- `path/to/test_file[.ext]` - Unit tests for the file above
- `path/to/another/file[.ext]` - Brief description (e.g., API route handler for data submission)
- `path/to/another/test_file[.ext]` - Unit tests for the file above
- `lib/utils/helpers[.ext]` - Brief description (e.g., Utility functions needed for calculations)
- `lib/utils/test_helpers[.ext]` - Unit tests for helpers

### Notes

- **File Extensions**: Use the extensions from the language configuration (e.g., `.py`, `.ts`, `.go`)
- **Test File Location**: Follow the language's testing conventions (co-located, separate `tests/` directory, etc.)
- **Test Command**: Use `[test-command-from-lang-config] [optional/path/to/test/file]` to run tests
- **Front Matter**: See `docs/front-matter-schema.md` for detailed field descriptions and examples

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/[feature-name]`)
- [ ] 1.0 Parent Task Title
  - [ ] 1.1 [Sub-task description 1.1]
  - [ ] 1.2 [Sub-task description 1.2]
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 [Sub-task description 2.1]
- [ ] 3.0 Parent Task Title (may not require sub-tasks if purely structural or configuration)
````

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate the detailed sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

## Target Audience

Assume the primary reader of the task list is a **junior developer** who will implement the feature.

## Language-Specific Adaptations

When generating the task list, apply these language-specific elements from the configuration file you loaded:

1. **File Extensions**: Use correct extensions for source and test files
2. **Test Commands**: Reference the appropriate testing framework and commands
3. **Directory Structure**: Follow language conventions for file organization
4. **Testing Patterns**: Describe test setup following language best practices
5. **Naming Conventions**: Use language-appropriate naming (camelCase, snake_case, PascalCase, etc.)

## Example: Language-Specific Task Variations

**TypeScript Project:**
```markdown
- `src/components/UserProfile.tsx` - User profile component
- `src/components/UserProfile.test.tsx` - Unit tests
- Run tests: `npx jest src/components/UserProfile.test.tsx`
```

**Python Project:**
```markdown
- `src/components/user_profile.py` - User profile module
- `tests/components/test_user_profile.py` - Unit tests
- Run tests: `pytest tests/components/test_user_profile.py`
```

**Go Project:**
```markdown
- `internal/user/profile.go` - User profile business logic
- `internal/user/profile_test.go` - Unit tests
- Run tests: `go test ./internal/user`
```

---

## Summary Checklist

Before generating tasks, ensure you have:
- [ ] Detected or asked about the programming language
- [ ] Read the corresponding `lang/[language].md` configuration file
- [ ] Confirmed to the user which language conventions you'll use
- [ ] Understood the feature requirements from the PRD or user description

Then proceed with the standard workflow: Generate parent tasks → Wait for "Go" → Generate sub-tasks → Save file.
