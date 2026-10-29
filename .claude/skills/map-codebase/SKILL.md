---
name: map-codebase
description: Survey a repository and write onboarding docs under ai-workspace/context/ — overview and codemap, module notes, key flows, reuse catalogue, change maps for rules spread across files, glossary and decision records — or refresh existing ones. Documents only verified facts. Use when asked to document a codebase, write onboarding or architecture docs for it, or refresh them.
metadata:
  owner: skpstg
  status: draft
---

## Rules

- Follow the [writing rules](../_shared/writing-rules.md).
- Write only under `ai-workspace/context/` (see the [workspace layout](../_shared/workspace.md)), in
  the [structure](structure.md). Create a file only when you have a verified fact for it.

## Before starting

- If `ai-workspace/context/` exists, this is a refresh. Check every statement in it against the code. Fix or delete
  the ones that are wrong and keep the rest.
- Read other docs in the repo (README, contributing guides, AGENTS.md) as leads to verify, not as
  facts.

## Steps

1. **Map.** List the top-level modules, entry points, build and test commands, external systems and
   which modules import which. Read the imports; do not infer from names. Do not go deep yet.
2. **Check with the user.** Show the module list and the scenarios that look most important. Ask,
   with your ask-the-user tool, which flows matter most and, for a large repo, which areas to cover
   first. Ask even when the repo is small, unless the user already said. Write nothing until they
   answer.
3. **Go deep, one module at a time.** Delegate a module to a subagent where available; it returns
   facts with evidence and writes nothing. For each module find:
   - what it owns and what nearby code it does not own
   - its public interface and invariants
   - reusable helpers, and any duplicates of them elsewhere
   - rules or features implemented in more than one place. Search the whole repo for their
     identifiers, constants and config keys so no place is missed, and note which tests cover them
   - domain terms and the different names the code uses for them
   - the reasons behind surprising choices, from commit messages, PRs or comments
4. **Trace** the flows the user chose, step by step through the code.
5. **Write** the docs.
6. **Verify.** Check that every path and symbol you cited exists. Run every "Find all" command and
   confirm it finds every place listed.
7. **Report** to the user:
   - files created and changed
   - risks you saw, such as a rule with no test or duplicated helpers. Do not fix them.

   Show the diff. Do not commit.
