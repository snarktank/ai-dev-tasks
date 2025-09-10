# Assumptions

This folder stores assumption logs and test plans produced while derisking opportunities and solutions.

## 📄 File Naming
- `assumptions-[opportunity-name]-[YYYY-MM-DD].md`

## 🧭 Where These Come From
- Use `@frameworks/continuous-discovery-habits/indentify-and-test-assumptions.mdc`
- Outputs should be saved here per the framework's Output section

## ✅ Suggested Structure
```markdown
# Assumptions — [Opportunity Name]

## Story Map Snapshot
- Actors and key steps that reveal risky moments

## Assumption Log
| ID | Category | Assumption | Evidence | Importance | Evidence Known | LoFA |

## Assumption Map (Summary)
- Top-right LoFA priorities

## Test Cards (LoFA)
- Hypothesis, simulation, method, audience, n & window, success criteria, next steps

## Results and Decisions
- What we learned and what changes next
```

## 🔁 Workflow
1. Start from a prioritized opportunity in `opportunities/`.
2. Create an assumptions file here and identify LoFA assumptions.
3. Run smallest viable tests; record results and decisions.
4. Update ideas/opportunities based on evidence.

---
Keep assumptions positive, specific, and tied to observable behavior.
