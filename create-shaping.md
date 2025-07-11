 # Rule: Generating a Shapping Document

## Goal

To guide an AI assistant in creating a detailed Shapping Document in Markdown format, based on an initial user prompt. The Shapping Document should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## Process

1.  **Receive Initial Prompt:** The user provides a brief description of a pitch that describes a new feature or functionality.
2.  **Ask Clarifying Questions:** Before writing the Shapping Document, the AI *must* ask clarifying questions to gather sufficient detail. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out). Make sure to provide options in letter/number lists so I can respond easily with my selections.
3.  **Generate Shapping Document:** Based on the initial prompt and the user's answers to the clarifying questions, generate a Shapping Document using the structure outlined below.
4.  **Save Shapping Document:** Save the generated document as `/shapping/${current_year}-${current_month}-${current_day}-${pitch_name}.md` inside the `/shapping` directory.

## Clarifying Questions (Examples)

The AI should adapt its questions based on the prompt, but here are some common areas to explore:

*   **Problem/Goal:** "What problem does this feature solve for the user?" or "What is the main goal we want to achieve with this feature?"
*   **Target User:** "Who is the primary user of this feature?"
*   **Core Functionality:** "Can you describe the key actions a user should be able to perform with this feature?"
*   **Definition of Done:** "What is the definition of done for this feature?"
*   **NO-Gos:** "Are there any specific things this feature *should not* do?"
*   **Design/UI:** "Are there any existing design mockups or UI guidelines to follow?" or "Can you describe the desired look and feel?"
*   **Rabbit Holes:** "Are there any potential rabbit holes or areas that could be problematic?"

## Shapping Document Structure

The generated Shapping Document should include the following sections:

1.  **Problem**
2.  **Proposed Solution**
3.  **Risks and Rabbit Holes**
4.  **No-Gos**

## Final instructions

1. Do NOT start implementing the Shapping Document
2. Make sure to ask the user clarifying questions
3. Take the user's answers to the clarifying questions and improve the Shapping Document
4. Take a look at @shaping/CLAUDE.md for more information on how to create a Shapping Document