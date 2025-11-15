# Language Configurations

This directory contains language-specific configurations for task generation. Each file defines the file extensions, testing conventions, and best practices for a particular programming language.

## Supported Languages

| Language | File | Description |
|----------|------|-------------|
| **TypeScript/JavaScript** | `typescript.md` | TypeScript, JavaScript, React, Node.js projects with Jest testing |
| **Python** | `python.md` | Python projects with pytest testing framework |
| **Go** | `go.md` | Go projects using built-in `testing` package |

## How to Use

When generating tasks with `generate-tasks.md`, the AI assistant will automatically read the appropriate language configuration based on:

1. **Explicit specification**: "Generate tasks for my Python project"
2. **PRD context**: Language mentioned in the Product Requirements Document
3. **Repository detection**: File extensions found in your codebase

## Adding a New Language

To add support for a new language, create a new file following this template:

```markdown
# [Language Name] Configuration

## File Extensions
[List source and test file extensions]

## Testing
[Primary testing framework and commands]

## File Organization
[Directory structure patterns and conventions]

## Conventions
[Language-specific best practices and standards]

## Example Task List Entry
[Sample relevant files section]
```

**Languages we'd love to see:**
- Java (`java.md`)
- Rust (`rust.md`)
- C# (`csharp.md`)
- Ruby (`ruby.md`)
- PHP (`php.md`)
- Kotlin (`kotlin.md`)
- Swift (`swift.md`)

## Contributing

When adding a new language configuration:

1. Follow the structure of existing language files
2. Include the most common testing framework as primary
3. Mention alternative frameworks if widely used
4. Provide realistic examples in the "Example Task List Entry" section
5. Update this README with the new language
6. Keep configurations focused on practical, actionable information

## File Naming Convention

- Use lowercase language names: `python.md`, not `Python.md`
- For languages with multiple names, use the most common: `typescript.md` (covers JavaScript too)
- For language variants, use hyphens: `typescript-react.md` (if needed in future)
