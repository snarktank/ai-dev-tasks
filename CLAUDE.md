# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is the AI Dev Tasks repository - a collection of markdown workflow files designed to help AI assistants systematically build features through structured PRDs and task lists. This repository itself contains the workflow templates, not user implementations.

## Core Workflow Files

The repository contains four essential workflow files:

1. **create-prd.md**: Guides PRD creation with clarifying questions
2. **generate-tasks.md**: Converts PRDs into detailed task lists
3. **process-task-list.md**: Manages systematic task execution with checkpoints
4. **update-ai-dev-tasks.md**: Updates workflow files to the latest version from upstream

## Workflow Process

### 1. PRD Creation
When asked to create a PRD or plan a feature:
- Use `create-prd.md` to guide the process
- Ask clarifying questions before writing the PRD
- Save PRDs as `/tasks/[n]-prd-[feature-name].md` (e.g., `0001-prd-user-auth.md`)
- Use 4-digit zero-padded sequence numbers starting from 0001

### 2. Task Generation
When converting a PRD to tasks:
- Use `generate-tasks.md` to create structured task lists
- First generate high-level parent tasks and wait for user confirmation ("Go")
- Then generate detailed sub-tasks
- Save as `/tasks/tasks-[prd-file-name].md`
- Include a "Relevant Files" section listing all files to be created/modified

### 3. Task Processing
When implementing tasks:
- Use `process-task-list.md` for systematic execution
- Complete one sub-task at a time
- Mark tasks with [x] immediately after completion
- Wait for user approval ("yes" or "y") before proceeding to next task
- When all sub-tasks under a parent are complete:
  - Run tests if available
  - Stage changes with `git add .`
  - Create descriptive commits
  - Mark parent task as complete

### 4. Updating Workflow Files
When asked to update the AI Dev Tasks workflow:
- Use `update-ai-dev-tasks.md` to fetch latest versions from upstream
- Preserves user's PRDs and task lists in `/tasks/`
- Updates only the core workflow files
- May update command files if needed

## Directory Structure

```
/tasks/              # Store all PRDs and task lists here
  0001-prd-*.md      # PRD files with sequential numbering
  tasks-0001-*.md    # Corresponding task lists
```

Create the `/tasks/` directory if it doesn't exist when saving the first PRD.

## Repository Maintenance

When working on this repository itself (not implementing it in other projects):

### Adding New Features
- New workflow files should follow the naming pattern: `[action]-[target].md`
- Update README.md to document new workflows
- Add new workflows to this CLAUDE.md file
- Ensure new workflows follow the established pattern of clear rules and process steps

### Updating Documentation
- Keep examples in README.md clear and concise
- Maintain consistency in terminology across all files
- Update the Claude Code section when command structure changes

### Version Control
- This repository is maintained at https://github.com/snarktank/ai-dev-tasks
- Pull requests should include clear descriptions of workflow improvements
- Test workflow changes in actual projects before proposing updates