# Rule: Debugging and Fixing Issues

## Goal

To guide an AI assistant in creating a detailed Issue Analysis Document in Markdown format, based on an initial bug report.

## Process

1.  **Receive Issue Report:** The user provides a bug description, error message, or unexpected behavior report.
2.  **Ask Clarifying Questions:** Before writing the analysis, the AI *must* ask only the most essential clarifying questions needed to understand and reproduce the issue. Limit questions to 3-5 critical areas. Make sure to provide options in letter/number lists so the user can respond easily with their selections.
3.  **Generate Issue Analysis:** Based on the initial report and the user's answers to the clarifying questions, generate an issue analysis using the structure outlined below.
4.  **Save Analysis:** Save the generated document as `issue-[bug-name].md` inside the `/tasks` directory.

## Clarifying Questions (Guidelines)

Ask only the most critical questions needed to understand and reproduce the issue. Focus on areas where the initial report is ambiguous or missing essential context. Common areas that may need clarification:

*   **Reproduction Steps:** If unclear - "What are the exact steps to reproduce this issue?"
*   **Expected vs. Actual Behavior:** If vague - "What should happen versus what actually happens?"
*   **Environment/Context:** If missing - "Where does this occur? (browser, user role, environment, etc.)"
*   **Frequency:** If unstated - "Does this happen every time or intermittently?"
*   **Impact:** If unclear - "How many users are affected and what is the severity?"

**Important:** Only ask questions when the answer isn't reasonably inferable from the initial report. Prioritize questions that would significantly impact the analysis quality.

### Formatting Requirements

- **Number all questions** (1, 2, 3, etc.)
- **List options for each question as A, B, C, D, etc.** for easy reference
- Make it simple for the user to respond with selections like "1A, 2C, 3B"

### Example Format

```
1. How often does this issue occur?
   A. Every time (100% reproducible)
   B. Most of the time (>75%)
   C. Sometimes (25-75%)
   D. Rarely (<25%)

2. What is the severity and impact?
   A. Critical - System unusable or data loss
   B. High - Major functionality broken
   C. Medium - Feature impaired, workaround exists
   D. Low - Cosmetic or minor inconvenience

3. Which environment(s) are affected?
   A. Production only
   B. Staging and production
   C. All environments
   D. Local development only
```

## Issue Analysis Structure

The generated issue analysis should include the following sections:

1.  **Issue Summary:** Brief, clear description of the problem in 1-2 sentences.
2.  **Impact Assessment:**
    *   Severity (Critical/High/Medium/Low)
    *   Affected Users (All users/Specific group/Individual users)
    *   Business Impact (Revenue/User experience/Data integrity/etc.)
3.  **Reproduction Steps:** Numbered, step-by-step instructions to consistently reproduce the issue.
4.  **Expected Behavior:** Clear description of what *should* happen.
5.  **Actual Behavior:** Clear description of what *actually* happens (including error messages or logs).
6.  **Environment Details:**
    *   Browser/Device/OS (if relevant)
    *   User role/permissions (if relevant)
    *   Environment (production/staging/local)
    *   Configuration or feature flags (if relevant)
7.  **Root Cause Analysis:** Initial investigation findings:
    *   Suspected root cause
    *   Relevant files/functions
    *   Related issues or patterns
8.  **Proposed Solution:** High-level approach to fixing the issue.
9.  **Fix Requirements:** Specific changes needed to resolve the issue. Number these requirements.
10. **Testing Requirements:**
    *   Verification steps (how to confirm fix works)
    *   Regression testing (what else might be affected)
    *   Edge cases to test
11. **Open Questions:** List any remaining questions or areas needing further investigation.

## Target Audience

Assume the primary reader of the issue analysis is a **junior developer**. Requirements should be explicit, unambiguous, and provide enough detail for them to understand the problem and approach the fix.

## Output

*   **Format:** Markdown (`.md`)
*   **Location:** `/tasks/`
*   **Filename:** `issue-[bug-name].md`

## Final instructions

1. Make sure to ask the user clarifying questions
2. Take the user's answers to the clarifying questions and create the issue analysis
3. Focus on understanding the *root cause*, not just symptoms
