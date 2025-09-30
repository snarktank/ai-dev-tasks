# Design

This folder contains design-related artifacts for the initiative.

## Contents

- **Design Briefs**: Machine-readable JSON specifications and stakeholder-friendly Markdown summaries
- **Figma Make Prompts**: Automated design generation prompts for Figma Make

## File Naming Conventions

- Design Briefs: `design-brief-[feature-name].[json|md]`
- Figma Make Prompts: `figma-make-prompt-[feature-name].json`

## Usage

### Design Briefs
Use `@create-design-brief.mdc` to generate:
- Machine-readable JSON specifications for Figma/Make and prototyping tools
- Stakeholder-friendly Markdown summaries
- Design system integration with existing components and tokens

### Figma Make Prompts
Use `@generate-figma-make-prompt.mdc` to create:
- Figma Make-ready prompts (max 5000 characters)
- Automated design generation specifications
- Brand-consistent design tokens and components

## Integration

These design artifacts integrate with:
- **Design System**: References existing components (Button, Card, Banner, MetricCard) and design tokens
- **Prototyping Tools**: Direct import into Figma Make for automated design generation
- **Brand Consistency**: Ensures consistent visual identity across advertising, branding, and social media

## Example Structure

```
design/
├── design-brief-mobile-redesign.json
├── design-brief-mobile-redesign.md
├── figma-make-prompt-mobile-redesign.json
└── README.md
```
