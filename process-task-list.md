# Task List Management

Guidelines for managing task lists in markdown files to track progress on completing a PRD

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

        ```
        git commit -m "feat: add payment validation logic" -m "- Validates card type and expiry" -m "- Adds unit tests for edge cases" -m "Related to T123 in PRD"
        ```
  3. Once all the subtasks are marked completed and changes have been committed, mark the **parent task** as completed.
- Stop after each sub‑task and wait for the user's go‑ahead.

## Task List Maintenance

1. **Update the task list as you work:**
   - Mark tasks and subtasks as completed (`[x]`) per the protocol above.
   - Add new tasks as they emerge.

2. **Maintain the "Relevant Files" section:**
   - List every file created or modified.
   - Give each file a one‑line description of its purpose.

## AI Instructions

When working with task lists, the AI must:

1. **Confirm and enrich the working context before proceeding**
   - Before starting any sub-task, identify and summarize all context sources that will influence the work (e.g., files, rules, code snippets, specifications).
   - Present this context clearly to the user:
     > “I plan to use the following context for this sub-task:  
     > [list of files / rules / snippets]  
     > Would you like to **add**, **remove**, or **adjust** anything?  
     > You may also include **additional considerations** (e.g., rules files, project constraints, encryption algorithms, standards, recent changes, or style preferences).”
   - Wait for explicit confirmation or updates from the user.
   - If new context or considerations are added, refresh the summary and reconfirm before proceeding.
   - Once confirmed, continue the task using the finalized context and considerations.

   **Notes:**
   - Encourages developers to surface tacit knowledge not captured in files.
   - Prevents “silent context gaps” that can cause unexpected outputs.
   - Reinforces trust and transparency between AI reasoning and developer intent.

2. Regularly update the task list file after finishing any significant work.
3. Follow the completion protocol:
   - Mark each finished **sub-task** `[x]`.
   - Mark the **parent task** `[x]` once **all** its subtasks are `[x]`.
4. Add newly discovered tasks.
5. Keep "Relevant Files" accurate and up to date.
6. Before starting work, check which sub-task is next.
7. After implementing a sub-task, update the file and then pause for user approval.
