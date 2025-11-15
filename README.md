# AI Dev Tasks

Welcome to **AI Dev Tasks**! This repository provides a collection of markdown files designed to supercharge your feature development workflow with AI-powered IDEs and CLIs. These tools work with any AI coding assistant including [Amp](https://ampcode.com), Claude Code, Windsurf, and others. By leveraging these structured prompts, you can systematically approach building features, from ideation to implementation, with built-in checkpoints for verification.

Stop wrestling with monolithic AI requests and start guiding your AI collaborator step-by-step!

## The Core Idea

Building complex features with AI can sometimes feel like a black box. This workflow aims to bring structure, clarity, and control to the process by:

1. **Defining Scope:** Clearly outlining what needs to be built with a Product Requirement Document (PRD).
2. **Detailed Planning:** Breaking down the PRD into a granular, actionable task list.
3. **Iterative Implementation:** Guiding the AI to tackle one task at a time, allowing you to review and approve each change.

This structured approach helps ensure the AI stays on track, makes it easier to debug issues, and gives you confidence in the generated code.

## Multi-Language Support

**AI Dev Tasks** now supports multiple programming languages! The workflow automatically adapts to your project's language, using the appropriate:

- File extensions (`.py`, `.ts`, `.go`, etc.)
- Testing frameworks (pytest, Jest, go test, etc.)
- Directory structures and naming conventions
- Language-specific best practices

### Supported Languages

| Language | Configuration File | Testing Framework |
|----------|-------------------|-------------------|
| **TypeScript/JavaScript** | `lang/typescript.md` | Jest (or Vitest, Mocha) |
| **Python** | `lang/python.md` | pytest (or unittest) |
| **Go** | `lang/go.md` | Built-in `testing` package |

Additional languages can be easily added by creating new configuration files in the `lang/` directory.

### How It Works

When generating tasks, the AI assistant will:

1. **Auto-detect** your language from:
   - Your explicit mention ("for my Python project")
   - The PRD content
   - File extensions in your repository

2. **Load language configuration** automatically from `lang/[language].md`

3. **Apply conventions** to the generated task list (file extensions, test commands, directory structure)

**Example:**
```text
Use @generate-tasks.md to create tasks for my Python project from @MyFeature-PRD.md
```

The AI will automatically use Python conventions (`.py` files, `pytest`, `tests/` directory structure).

## Workflow: From Idea to Implemented Feature

Here's the step-by-step process using the `.md` files in this repository:

### 1. Create a Product Requirement Document (PRD)

First, lay out the blueprint for your feature. A PRD clarifies what you're building, for whom, and why.

You can create a lightweight PRD directly within your AI tool of choice:

1. Ensure you have the `create-prd.md` file from this repository accessible.
2. In your AI tool, initiate PRD creation:

    ```text
    Use @create-prd.md
    Here's the feature I want to build: [Describe your feature in detail]
    Reference these files to help you: [Optional: @file1.py @file2.ts]
    ```


    ![Example of initiating PRD creation](https://pbs.twimg.com/media/Go6DDlyX0AAS7JE?format=jpg&name=large)

### 2. Generate Your Task List from the PRD

With your PRD drafted (e.g., `MyFeature-PRD.md`), the next step is to generate a detailed, step-by-step implementation plan for your AI Developer.

1. Ensure you have `generate-tasks.md` accessible.
2. In your AI tool, use the PRD to create tasks:

    ```text
    Now take @MyFeature-PRD.md and create tasks using @generate-tasks.md
    ```
    *(Note: Replace `@MyFeature-PRD.md` with the actual filename of the PRD you generated in step 1.)*

    ![Example of generating tasks from PRD](https://pbs.twimg.com/media/Go6FITbWkAA-RCT?format=jpg&name=medium)

### 3. Examine Your Task List

You'll now have a well-structured task list, often with tasks and sub-tasks, ready for the AI to start working on. This provides a clear roadmap for implementation.

![Example of a generated task list](https://pbs.twimg.com/media/Go6GNuOWsAEcSDm?format=jpg&name=medium)

### 4. Instruct the AI to Work Through Tasks (and Mark Completion)

To ensure methodical progress and allow for verification, instruct the AI to work through the task list one sub-task at a time.

1. In your AI tool, tell the AI to start with the first task (e.g., `1.1`):

    ```text
    Please start on task 1.1 from the generated task list.
    ```

    The AI will attempt the task and then prompt you to review.

    ![Example of starting on a task](https://pbs.twimg.com/media/Go6I41KWcAAAlHc?format=jpg&name=medium)

### 5. Progress

The AI will continue working through the remaining tasks in the list.

![Example of a progressing task list with completed items](https://pbs.twimg.com/media/Go6KrXZWkAA_UuX?format=jpg&name=medium)

While it's not always perfect, this method has proven to be a very reliable way to build out larger features with AI assistance.

### Video Demonstration

If you'd like to see this in action, I demonstrated it on [Claire Vo's "How I AI" podcast](https://www.youtube.com/watch?v=fD4ktSkNCw4).

[![Demonstration of AI Dev Tasks on How I AI Podcast](https://img.youtube.com/vi/fD4ktSkNCw4/maxresdefault.jpg)](https://www.youtube.com/watch?v=fD4ktSkNCw4).

## Repository Structure

```
/
├── create-prd.md              # PRD generation guide
├── generate-tasks.md          # Task list generation (language-agnostic)
├── lang/                      # Language-specific configurations
│   ├── README.md              # Language index and contribution guide
│   ├── typescript.md          # TypeScript/JavaScript conventions
│   ├── python.md              # Python conventions
│   └── go.md                  # Go conventions
├── docs/                      # Documentation
│   └── front-matter-schema.md # YAML front matter specification
├── README.md                  # This file
└── LICENSE
```

### Core Files

* **`create-prd.md`**: Guides the AI in generating a Product Requirement Document (PRD) for your feature with structured metadata.
* **`generate-tasks.md`**: Takes a PRD and helps the AI break it down into a detailed, language-appropriate task list.

### Language Configurations (`lang/`)

Each language file defines:
- File extensions and naming conventions
- Testing frameworks and commands
- Directory structure patterns
- Language-specific best practices

See `lang/README.md` for the full list of supported languages and how to add new ones.

### Documentation (`docs/`)

* **`front-matter-schema.md`**: Specification for YAML front matter metadata included in all generated documents (PRDs and task lists). Enables better organization, traceability, and version tracking.

## Benefits

* **Structured Development:** Enforces a clear process from idea to code.
* **Multi-Language Support:** Works seamlessly with TypeScript, Python, Go, and more. Each language uses appropriate conventions and tooling.
* **Step-by-Step Verification:** Allows you to review and approve AI-generated code at each small step, ensuring quality and control.
* **Manages Complexity:** Breaks down large features into smaller, digestible tasks for the AI, reducing the chance of it getting lost or generating overly complex, incorrect code.
* **Improved Reliability:** Offers a more dependable approach to leveraging AI for significant development work compared to single, large prompts.
* **Clear Progress Tracking:** Provides a visual representation of completed tasks, making it easy to see how much has been done and what's next.
* **Document Metadata:** Generated PRDs and task lists include YAML front matter for better organization, versioning, and traceability.

## How to Use

1. **Clone or Download:** Get these `.md` files into your project or a central location where your AI tool can access them.
   ```bash
   git clone https://github.com/snarktank/ai-dev-tasks.git
   ```
2. **Follow the Workflow:** Systematically use the `.md` files in your AI assistant as described in the workflow above.
3. **Adapt and Iterate:**
    * Feel free to modify the prompts within the `.md` files to better suit your specific needs or coding style.
    * If the AI struggles with a task, try rephrasing your initial feature description or breaking down tasks even further.



## Tips for Success

* **Be Specific:** The more context and clear instructions you provide (both in your initial feature description and any clarifications), the better the AI's output will be.
* **Specify Your Language:** Mention your programming language when generating tasks (e.g., "for my Python project"). The AI will auto-detect it, but explicit mentions ensure accuracy.
* **Correct File Tagging:** Always ensure you're accurately tagging the PRD filename (e.g., `@MyFeature-PRD.md`) when generating tasks.
* **Patience and Iteration:** AI is a powerful tool, but it's not magic. Be prepared to guide, correct, and iterate. This workflow is designed to make that iteration process smoother.
* **Language Fallback:** If the AI doesn't auto-detect your language, you can explicitly reference both files: `@generate-tasks.md @lang/python.md`

## Contributing

Got ideas to improve these `.md` files or have new ones that fit this workflow? Contributions are welcome!

### Adding New Languages

Want to add support for your favorite programming language? It's easy!

1. Create a new file in `lang/` directory (e.g., `lang/rust.md`, `lang/java.md`)
2. Follow the structure of existing language files:
   - File extensions
   - Testing frameworks and commands
   - Directory structure conventions
   - Language-specific best practices
   - Example task list entries
3. Update `lang/README.md` to include your new language
4. Submit a pull request!

See `lang/README.md` for detailed contribution guidelines.

### Other Contributions

Please feel free to:

* Open an issue to discuss changes or suggest new features.
* Submit a pull request with your enhancements.
* Improve documentation or fix typos.

---

Happy AI-assisted developing!
