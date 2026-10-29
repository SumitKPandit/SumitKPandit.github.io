# ai-workspace/context/ structure

Create a file only when you have at least one verified fact to put in it. A small repo may need
only `ai-workspace/context/README.md`.

| File | Answers |
|---|---|
| `ai-workspace/context/README.md` | What does this system do, what are its parts, and where is everything documented? |
| `ai-workspace/context/modules/<module>.md` | What does this module own, expose and guarantee? |
| `ai-workspace/context/flows/<flow>.md` | What happens, step by step, when this scenario runs? |
| `ai-workspace/context/reuse.md` | Does what I need already exist? |
| `ai-workspace/context/change-maps.md` | If I change this rule, where else must I change it? |
| `ai-workspace/context/glossary.md` | What does this term mean, and what is it called in the code? |
| `ai-workspace/context/decisions/NNNN-<slug>.md` | Why is it like this? |

## ai-workspace/context/README.md

The entry point. Keep it to one page.

```markdown
# <System name>

<What it does and for whom, in at most three sentences.>

## External systems
<Databases, APIs, queues it talks to, and which module talks to each.>

## Codemap
| Module | Path | Purpose | Depends on | Entry point |
|---|---|---|---|---|

## Dependency rules
<Only rules the code enforces or the user confirmed, e.g. "domain/ never imports infra/".>

## Run and test
<Commands, or a link to where the repo already documents them.>

## Docs index
<Each file in ai-workspace/context/ and what it holds.>
```

For a large repo, group the codemap rows under one heading per domain.

## ai-workspace/context/modules/<module>.md

Only for a module with facts beyond its codemap row.

```markdown
# <module>
Owns: <responsibilities>
Does not own: <nearby responsibilities and the module that owns them>
Public interface: <entry symbols, events, endpoints>
Depends on: <modules>    Used by: <modules>
Key types: <types and how they must be used>
Invariants: <what must always hold>
Gotchas: <surprises, with links to change-maps.md entries>
```

## ai-workspace/context/flows/<flow>.md

Only for the few scenarios the user confirms matter most.

```markdown
# <Flow name>
Trigger: <what starts it>
Steps:
1. <module>: <symbol> — <what it does>
Side effects: <writes, events, calls to external systems>
Failure handling: <what happens when a step fails>
```

Add a Mermaid sequence diagram only when the flow crosses more modules than a short list shows
clearly.

## ai-workspace/context/reuse.md

Indexed by what the reader needs, not by where the code lives.

```markdown
| I need to | Use | Existing duplicates |
|---|---|---|
```

## ai-workspace/context/change-maps.md

One entry per rule or feature implemented in more than one place.

```markdown
## <Rule name>
Rule: <the rule in plain language>
Lives in: <path: symbol — role> for every place
Find all: `<search command that finds every place>`
Checked by: <tests that cover it, or "no test">
```

## ai-workspace/context/glossary.md

```markdown
| Term | Meaning | Code names | Where |
|---|---|---|---|
```

## ai-workspace/context/decisions/NNNN-<slug>.md

Only when a source states the reason: a commit message, PR, code comment or the user.

```markdown
# NNNN <Decision>
Context: <the situation>
Decision: <what was chosen>
Why: <the stated reason>
Source: <commit, PR, comment or "confirmed by the user on YYYY-MM-DD">
```
