# 🚀 Cursor for Product Managers 🤖

Welcome to **Cursor for Product Managers**! This repository provides a comprehensive toolkit and framework designed to supercharge your product management workflow using Cursor as an AI-native PM copilot. Originally inspired by the [Maven course on AI-native PMs](https://maven.com/p/0a96cb/cursor-isn-t-just-for-coding-how-ai-native-p-ms-work), the [AI Dev Tasks](https://github.com/snarktank/ai-dev-tasks/tree/main) structured workflow approach, and [Lee Robinson's YouTube video](https://www.youtube.com/watch?v=8QN23ZThdRY), this toolkit transforms Cursor from a coding tool into a powerful product thinking, strategic decision-making, and document creation platform.

Stop wrestling with fragmented product management tools and start building a unified, AI-powered PM workspace that grows smarter with every conversation!

## ✨ The Core Idea

Product management involves complex workflows across research, discovery, and delivery. This toolkit aims to bring structure, clarity, and AI-native efficiency to the process by:

1. **Unified Context Management**: Centralizing all PM knowledge, frameworks, and insights in one AI-accessible workspace
2. **Structured Discovery**: Leveraging proven frameworks like Continuous Discovery Habits for systematic user research
3. **AI-Native Workflows**: Using Cursor's capabilities for document-centric work, selective context, and visual diffs
4. **Iterative Improvement**: Building documents that grow smarter with every AI interaction

This approach helps ensure your AI copilot stays on track, makes it easier to manage complex product initiatives, and gives you confidence in AI-generated strategic content.

## 🗂️ Repository Structure

### Company Level Context (`company-level-context/`)
- **Product Vision & Strategy** (`product-vision-and-strateggy/`): 
  - `product-strategy-review.mdc`: PRISM-aligned strategy review framework with auto-gate evidence readiness
  - `product-vision-review.mdc`: Vision evaluation framework with 4-criteria scoring system
- **OKRs** (`okrs/`): 
  - `okr-sparring-partner.mdc`: Context-aware OKR coaching and sparring partner
- **Team Structure** (`team-structure/`): 
  - `readme.md`: Team organization models, design principles, and re-org considerations

### Copilots (`copilots/`)
- **PM Strategic Copilot** (`pm-strategic-copilot.mdc`): Preconfigured prompts and workflows for strategic assistance

### Frameworks (`frameworks/`)
- **Continuous Discovery Habits** (`continuous-discovery-habits/`):
  - `create-interview-snapshots.mdc`
  - `create-opportunities.mdc`
  - `generate-solutions.mdc`
  - `indentify-and-test-assumptions.mdc`
  - `synthesize-interview-snapshots.mdc`
- **Evidence-Guided** (`evidence-guided/`):
  - `calculate-ice-score.mdc`
- **Strategic Review** (in `company-level-context/product-vision-and-strateggy/`):
  - **PRISM Product Strategy Review**: 5-dimension framework (Problem, Reframe, Intentional Bets, Systemized Execution, Momentum) with auto-gate evidence readiness
  - **Product Vision Review**: 4-criteria evaluation (Lofty & Inspiring, Realistic & Attainable, Constraint-Free, Grounded in User Problem)

### Guides (`guides/`)
- **Meetings** (`meetings/`): `1-1s.mdc`
- **Product** (`product/`): `create-prd.mdc`, `generate-tasks.mdc`, `process-task-list.mdc`
- **Writing** (`writing/`): `writing.mdc`

### Initiatives (`initiatives/`)
- **Templates** (`_templates/`):
  - `setup-new-initiative.mdc`
  - `initiative-template/` with subfolders for `assumptions/`, `opportunities/`, `prd/`, `product-analytics/`, `solutions/`, `tasks/`, and `user-interviews/`
- **Archive** (`archive/`): Archived initiatives (`README.md`)

### Meeting Notes (`meeting-notes/`)
- `1-1 notes/`, `leadership/`, `product-trio/`, `board-n-investor/`

> Tip: When referencing files in Cursor, use the exact path names above.

## 🧭 Quick Start

1. Clone this repository to your local workspace
2. In Cursor, use `@` to mention files (e.g., `@company-level-context/product-vision-and-strateggy/product-strategy-review.mdc`)
3. Start with strategic review frameworks:
   - **Strategy Review**: `@company-level-context/product-vision-and-strateggy/product-strategy-review.mdc`
   - **Vision Evaluation**: `@company-level-context/product-vision-and-strateggy/product-vision-review.mdc`
   - **OKR Coaching**: `@company-level-context/okrs/okr-sparring-partner.mdc`
4. Or begin with product development: `guides/product/create-prd.mdc` or `initiatives/_templates/setup-new-initiative.mdc`

## 🚀 How to Use

### 1️⃣ Setup Your AI-Native PM Workspace

First, ensure you have Cursor installed and these framework files accessible:

1. Clone or download this repository to your local workspace
2. In Cursor's Agent chat, reference files with `@` (e.g., `@frameworks/continuous-discovery-habits/create-interview-snapshots.mdc`)
3. Follow the structured workflows for different PM activities

### 2️⃣ Leverage AI Dev Tasks Framework

This toolkit integrates with the [AI Dev Tasks](https://github.com/snarktank/ai-dev-tasks/tree/main) structured workflow for complex product initiatives:

1. **Create PRDs**: Use AI to generate comprehensive Product Requirement Documents
2. **Break Down Tasks**: Decompose PRDs into actionable, granular task lists
3. **Iterative Implementation**: Guide AI through one task at a time with verification checkpoints
4. **Progress Tracking**: Visual representation of completed tasks and next steps

### 3️⃣ Document-Centric Workflow

Instead of chat-based interactions, work directly in documents that grow smarter:

- **Selective Context**: Provide only necessary information to AI for focused assistance
- **Visual Diffs**: Clearly see AI-generated content changes and modifications
- **Continuous Learning**: Documents improve with every AI interaction and iteration

## 🔄 Common Workflows

- **Create a PRD**: Start with `guides/product/create-prd.mdc`
- **Generate and Process Tasks**: Use `guides/product/generate-tasks.mdc` and `guides/product/process-task-list.mdc`
- **Run Continuous Discovery**: Follow `frameworks/continuous-discovery-habits/*`
- **Score Ideas (ICE)**: Use `frameworks/evidence-guided/calculate-ice-score.mdc`
- **Review Product Strategy**: Use `company-level-context/product-vision-and-strateggy/product-strategy-review.mdc` with PRISM framework
- **Evaluate Product Vision**: Use `company-level-context/product-vision-and-strateggy/product-vision-review.mdc` with 4-criteria scoring
- **Coach OKRs**: Use `company-level-context/okrs/okr-sparring-partner.mdc` for context-aware OKR development
- **Design Team Structure**: Reference `company-level-context/team-structure/readme.md` for organizational models
- **Start a New Initiative**: Use `initiatives/_templates/setup-new-initiative.mdc` and the `initiative-template/` structure

## 🌟 Key Benefits

* **Structured PM Workflow**: Enforces clear processes from research to delivery
* **AI-Native Efficiency**: Leverages Cursor's capabilities for PM-specific tasks
* **Context Preservation**: Maintains product context across all AI interactions
* **Framework Integration**: Built-in proven PM methodologies and frameworks
* **Strategic Review System**: PRISM-aligned strategy evaluation with auto-gate evidence readiness
* **Vision & OKR Coaching**: Systematic evaluation and coaching for vision clarity and goal setting
* **Organizational Intelligence**: Team structure models and design principles for better alignment
* **Iterative Improvement**: Documents and frameworks evolve with use
* **Unified Knowledge Base**: Single source of truth for all PM activities

## 🛠️ Framework Integration

### Continuous Discovery Habits
- **Interview Snapshots**: Structured templates for user research documentation
- **Opportunity Mapping**: Systematic approach to identifying product opportunities
- **Solution Generation**: AI-assisted ideation and solution development
- **Synthesis**: Research insights consolidation and pattern recognition

### Evidence-Guided Decision Making
- Data-driven frameworks for strategic decisions
- A/B testing templates and analysis tools
- User behavior analysis frameworks
- ROI calculation and measurement tools

### Strategic Review & Evaluation
- **PRISM Product Strategy Review**: Comprehensive 5-dimension evaluation framework (Problem Diagnosis, Reframe Opportunity, Intentional Bets, Systemized Execution, Momentum & Meta-Reflection) with auto-gate evidence readiness checks
- **Product Vision Review**: 4-criteria vision evaluation system (Lofty & Inspiring, Realistic & Attainable, Constraint-Free, Grounded in User Problem) with 0-5 scoring
- **OKR Sparring Partner**: Context-aware OKR coaching that considers organization size, industry, and maturity level for realistic, executable goal setting
- **Team Structure Design**: Organizational models (Functional, Matrix, Value Stream, Divisional) with design principles and re-org considerations

## 💡 Tips for Success

* **Be Specific**: Provide clear context and specific instructions to your AI copilot
* **Use MAX Mode**: For complex PRDs and strategic documents, consider using Cursor's MAX mode
* **Document Everything**: Build your knowledge base systematically through regular documentation
* **Iterate and Improve**: Use AI feedback to continuously enhance your frameworks and templates
* **Maintain Context**: Keep your AI copilot informed about your product strategy and goals

## 🔧 Cursor-Specific Features

- **Document-Centric Work**: Work in documents rather than chats for better context retention
- **Selective Context**: Choose what information to share with AI for focused assistance
- **Visual Diffs**: Clearly see AI-generated changes and modifications
- **From Instructions to Initiatives**: Build complete product initiatives step by step

## 🤝 Contributing

Got ideas to improve these frameworks or have new PM methodologies to share? Contributions are welcome!

Please feel free to:
* Open an issue to discuss changes or suggest new frameworks
* Submit a pull request with your enhancements
* Share your PM workflow improvements and learnings

## 🙏 Acknowledgments

- **[Cursor isn't just for coding: how AI-native PMs work](https://maven.com/p/0a96cb/cursor-isn-t-just-for-coding-how-ai-native-p-ms-work)** - Tal Raviv and Hilary Gridley's course on transforming Cursor into a PM AI copilot
- **[AI Dev Tasks](https://github.com/snarktank/ai-dev-tasks/tree/main)** - Structured workflow framework for AI-assisted development that inspired our PM workflow approach
- **[Cursor AI Agents Work Like 10 Developers (Cursor VP Live Demo)](https://www.youtube.com/watch?v=8QN23ZThdRY)** - Lee Robinson demonstrates how Cursor AI agents automate developer tasks.

- **[Continuous Discovery Habits](https://www.youtube.com/watch?v=9RFaz9ZBXpk)** - Teresa Torres' book on continuous discovery
- **[Evidence-Guided](https://www.youtube.com/watch?v=aJWSn-tz3jQ)** - Itamar Gilad's book on evidence-guided product development

## ⚠️ Important Notes

This repository contains experimental and technical approaches to AI-native product management. While powerful, these methods may not be suitable for everyone. Recommended for PMs who are fluent in AI tools and want to explore the future of AI-native product teams.

---

Happy AI-assisted product managing! 🚀
