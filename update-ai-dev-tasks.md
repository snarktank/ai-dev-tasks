# Rule: Update AI Dev Tasks from Upstream

## Goal

To update the AI Dev Tasks workflow files in your project with the latest version from the original repository, ensuring you have the newest features and improvements.

## Process

When asked to update the AI Dev Tasks workflow, the AI should:

1. **Check Current Setup:**
   - Verify the location of the ai-dev-tasks files in the current project (typically `/ai-dev-tasks/`)
   - Note any local modifications if they exist

2. **Fetch Latest Version:**
   - Download the latest files from the original repository:
     - `create-prd.md`
     - `generate-tasks.md`
     - `process-task-list.md`
     - `update-ai-dev-tasks.md` (this file)
   - Source: https://github.com/snarktank/ai-dev-tasks

3. **Update Files:**
   - Replace the existing workflow files with the latest versions
   - Preserve the `/tasks/` directory and any existing PRDs/task lists
   - Do NOT modify any user-created PRDs or task lists

4. **Update Commands (if needed):**
   - Check if the command structure in `.claude/commands/` needs updating
   - Update command files if new workflows have been added or existing ones changed

5. **Report Changes:**
   - Inform the user about which files were updated
   - Note if any new workflow files were added
   - Mention if command updates are recommended

## Important Notes

- This process only updates the core workflow files, not user-created content
- Existing PRDs and task lists in `/tasks/` are never modified
- If local modifications exist, ask the user before overwriting
- After updating, the user should restart Claude Code (`/exit`) if commands were updated

## Usage

To trigger an update, the user can simply say:
- "Update the AI Dev Tasks workflow files"
- "Get the latest version of AI Dev Tasks"
- "Update ai-dev-tasks from upstream"