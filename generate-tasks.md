# Rule: Generating a Task List from a PRD

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format based on an existing Product Requirements Document (PRD). Each task and sub-task must include a comprehensive description and complexity calculation (1-5 scale) to help developers understand the scope and effort required for implementation.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[prd-file-name].md` (e.g., `tasks-prd-user-profile-editing.md`)

## Process

1. **Receive PRD Reference:** The user points the AI to a specific PRD file
2. **Analyze PRD:** The AI reads and analyzes the functional requirements, user stories, and other sections of the specified PRD.
3. **Assess Current State:** Review the existing codebase to understand existing infrastructre, architectural patterns and conventions. Also, identify any existing components or features that already exist and could be relevant to the PRD requirements. Then, identify existing related files, components, and utilities that can be leveraged or need modification.
4. **Phase 1: Generate Parent Tasks:** Based on the PRD analysis and current state assessment, create the file and generate the main, high-level tasks required to implement the feature. For each parent task, include a title, description, and complexity calculation. Use your judgement on how many high-level tasks to use. It's likely to be about 3-7 main tasks.
5. **Inform the user:** Present these tasks to the user in the specified format (without sub-tasks yet) For example, say "I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed." .
6. **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
7. **Phase 2: Generate Sub-Tasks:** Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete the parent task. For each task and sub-task, include:

   - **Description:** A detailed explanation of what needs to be accomplished and why
   - **Complexity:** A calculated complexity score (1-5 scale) with color icon (🟢🟡🟠🔴🟣) based on technical difficulty, time estimation, and dependencies

   Ensure sub-tasks logically follow from the parent task, cover the implementation details implied by the PRD, and consider existing codebase patterns where relevant without being constrained by them.
8. **Identify Relevant Files:** Based on the tasks and PRD, identify potential files that will need to be created or modified. List these under the `Relevant Files` section, including corresponding test files if applicable.
9. **Generate Final Output:** Combine the parent tasks, sub-tasks, relevant files, and notes into the final Markdown structure.
10. **Save Task List:** Save the generated document in the `/tasks/` directory with the filename `tasks-[prd-file-name].md`, where `[prd-file-name]` matches the base name of the input PRD file (e.g., if the input was `prd-user-profile-editing.md`, the output is `tasks-prd-user-profile-editing.md`).

## Output Format

The generated task list _must_ follow this structure:

```markdown
## Relevant Files

- `path/to/potential/file1.ts` - Brief description of why this file is relevant (e.g., Contains the main component for this feature).
- `path/to/file1.test.ts` - Unit tests for `file1.ts`.
- `path/to/another/file.tsx` - Brief description (e.g., API route handler for data submission).
- `path/to/another/file.test.tsx` - Unit tests for `another/file.tsx`.
- `lib/utils/helpers.ts` - Brief description (e.g., Utility functions needed for calculations).
- `lib/utils/helpers.test.ts` - Unit tests for `helpers.ts`.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Parent Task Title
  - **Description:** Detailed explanation of what this parent task accomplishes and its importance to the overall feature implementation
  - **Complexity:** 🔴 4/5 (High complexity due to multiple integrations and database changes)
  - [ ] 1.1 Sub-task description 1.1
    - **Description:** Specific explanation of what this sub-task involves and how it contributes to the parent task
    - **Complexity:** 🟡 2/5 (Medium-low complexity, straightforward implementation)
  - [ ] 1.2 Sub-task description 1.2
    - **Description:** Detailed description of the sub-task requirements and expected outcomes
    - **Complexity:** 🟠 3/5 (Medium complexity due to API integration requirements)
- [ ] 2.0 Parent Task Title
  - **Description:** Clear explanation of the parent task scope and deliverables
  - **Complexity:** 🟡 2/5 (Medium-low complexity, mostly configuration changes)
  - [ ] 2.1 Sub-task description 2.1
    - **Description:** Specific implementation details and requirements for this sub-task
    - **Complexity:** 🟢 1/5 (Low complexity, simple configuration update)
- [ ] 3.0 Parent Task Title
  - **Description:** Description of structural or configuration changes needed
  - **Complexity:** 🟢 1/5 (Low complexity, purely structural or configuration)
```

## Complexity Calculation Guidelines

When assigning complexity scores (1-5 scale), consider the following factors:

### Complexity Scale

- **🟢 1/5 (Very Low):** Simple configuration changes, basic text updates, or straightforward single-file modifications
- **🟡 2/5 (Low):** Simple component creation, basic API calls, or minor database schema changes
- **🟠 3/5 (Medium):** Complex component logic, multiple file modifications, API integrations with error handling
- **🔴 4/5 (High):** Complex business logic, database migrations, multiple system integrations, performance considerations
- **🟣 5/5 (Very High):** Architecture changes, complex algorithms, multiple service integrations, significant refactoring

### Factors to Consider

- **Technical Difficulty:** How complex is the implementation logic?
- **Dependencies:** How many other components/systems are affected?
- **Time Estimation:** Approximate development time (1=<2hrs, 2=2-4hrs, 3=4-8hrs, 4=1-2days, 5=>2days)
- **Risk Level:** Potential for introducing bugs or breaking existing functionality
- **Testing Requirements:** Amount of testing needed (unit, integration, e2e)

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate the detailed sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

## Target Audience

Assume the primary reader of the task list is a **junior developer** who will implement the feature with awareness of the existing codebase context.
