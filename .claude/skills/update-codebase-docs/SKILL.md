---
name: update-codebase-docs
description: Record verified facts about a repo into its existing ai-workspace/context/ docs (codemap, module notes, flows, reuse catalogue, change maps, glossary, decisions) and fix statements there that have drifted from the code. Edits existing files only. Use after work in a repo taught you something non-obvious that ai-workspace/context/ is missing or gets wrong.
metadata:
  owner: skpstg
  status: draft
---

## When to use

- You learned a non-obvious fact about the codebase while working, and `ai-workspace/context/` is missing it.
- You found a statement in `ai-workspace/context/` that the code contradicts.

## When NOT to use

- `ai-workspace/context/README.md` does not exist. Tell the user `/map-codebase` creates the docs.
- To document areas you have not worked in. Only record what the work at hand taught you.

## Rules

- Follow the [writing rules](../_shared/writing-rules.md).
- Never create a file. Only edit files that already exist under `ai-workspace/context/` (see the
  [workspace layout](../_shared/workspace.md)). If a fact has no home in
  them, list it in your report and suggest `/map-codebase`.
- Only edit files under `ai-workspace/context/`. If you notice drift in other docs, tell the user.

## Steps

1. Read `ai-workspace/context/README.md`. Its docs index says which file holds which kind of fact.
2. List the candidate facts from your work: missing facts and drifted statements. For each, check it
   against the writing rules. Ask the user about any you are not certain of.
3. Find each fact's home and edit it in place.
4. Check that every path and symbol you cited exists. Run every search command you added or changed
   and confirm it finds the places it should.
5. Show the user the diff with one line of evidence per change. Do not commit.
