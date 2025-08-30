# Task List Management

Guidelines for managing task lists in markdown files to track progress on completing a PRD

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[task-id-title].md` (e.g., `tasks-1-create-structure.md`)

## Task Implementation

- **One sub-task at a time:** Do **NOT** start the next sub‑task until you ask the user for permission and they say "yes" or "y"
- **Completion protocol:**
  1. When you finish a **sub‑task**, immediately mark it as completed by changing `[ ]` to `[x]`.
  2. If **all** subtasks underneath a parent task are now `[x]`, follow this sequence:
     - **First**: Run the full test suite (`pytest`, `npm test`, `bin/rails test`, etc.)
     - **Only if all tests pass**: Stage changes (`git add .`)
     - **Clean up**: Remove any temporary files and temporary code before committing
     - **Commit**: Use a descriptive commit message that:
       - Uses conventional commit format (`feat:`, `fix:`, `refactor:`, etc.)
       - Summarizes what was accomplished in the parent task
       - Lists key changes and additions
       - References the task number and PRD context
       - **Formats the message as a single-line command using `-m` flags**, e.g.:

        ```bash
        git commit -m "feat: add payment validation logic" -m "- Validates card type and expiry" -m "- Adds unit tests for edge cases" -m "Related to T123 in PRD"
        ```

  3. Once all the subtasks are marked completed and changes have been committed:
     - **Create individual task file**: Generate a markdown file for the completed parent task following the output format above
     - **Task file structure**: Include the task ID and title as header, followed by a comprehensive summary of all operations performed by the AI to complete the task
     - Mark the **parent task** as completed.
- Stop after each sub‑task and wait for the user's go‑ahead.

## Individual Task Documentation

When completing a parent task, create a dedicated markdown file with the following structure:

### File Format

```markdown
# Task [ID]: [Title]

## Summary
[Comprehensive summary of all operations performed to complete this task]

## Operations Performed
- [Detailed list of all actions taken by the AI]
- [Include file modifications, creations, configurations, etc.]
- [Mention any challenges encountered and how they were resolved]

## Files Modified/Created
- `path/to/file1.ext` - Description of changes made
- `path/to/file2.ext` - Description of what was created

## Testing
- [Description of tests run and results]
- [Any test files created or modified]

## Completion Status
- [x] All subtasks completed
- [x] Tests passing
- [x] Changes committed
```

## Task List Maintenance

1. **Update the task list as you work:**
   - Mark tasks and subtasks as completed (`[x]`) per the protocol above.
   - Add new tasks as they emerge.

2. **Maintain the "Relevant Files" section:**
   - List every file created or modified.
   - Give each file a one‑line description of its purpose.

## AI Instructions

When working with task lists, the AI must:

1. Regularly update the task list file after finishing any significant work.
2. Follow the completion protocol:
   - Mark each finished **sub‑task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.
   - **Create individual task documentation** for each completed parent task.
3. Add newly discovered tasks.
4. Keep "Relevant Files" accurate and up to date.
5. Before starting work, check which sub‑task is next.
6. After implementing a sub‑task, update the file and then pause for user approval.
7. **Generate task summary files**: When completing a parent task, create a dedicated markdown file documenting all operations performed, following the specified format and naming convention.
