# Plan template

Keep every section. Write "None" when a section does not apply, so the reader knows it was
checked. Keep each section as short as the change allows. Point to code by path and symbol, never
by line number.

```markdown
# <Change title>
Status: draft | approved on YYYY-MM-DD
Type: bug fix | feature

## Problem
<Bug: what happens, what should happen, how to reproduce it, and the root cause with its
evidence. Feature: who needs what, and why.>

## Done when
<Every test in User stories and tests passes, the existing suite passes, and any other check the
user asked for.>

## Out of scope
<What this change will not do.>

## User stories and tests
Approved on YYYY-MM-DD

### Story: <title>
As a <role>, I can <capability>, so that <benefit>.

Scenario: <name>
  Given <starting state>
  When <action>
  Then <expected outcome>
  Test: <test file, following the repo's test layout>. Fails today because <reason>.

<One story per capability; for a bug, a story for the correct behaviour. Scenarios cover the
normal case, edge cases and errors. For a bug, one scenario reproduces it.>

### Existing behaviour to protect
| Behaviour that must stay | Covered by | Test to add (passes today) |
|---|---|---|
<Every behaviour the change touches and must keep. "Covered by" names an existing test or says
"no test"; every "no test" row gets a test to add.>

### Existing tests to update
| Test | Asserts today | New expectation |
|---|---|---|
<Tests that assert behaviour the requirement changes.>

## Decisions
| Decision | Options considered | Chosen | Why |
|---|---|---|---|
<Every decision the user made, and why.>

## Context
<The code involved, as path: symbol — role. Other places the same rule lives. Existing code to
reuse.>

## Steps
1. Add the tests in "Existing behaviour to protect". Verify: they pass.
2. Add the scenario tests and update the tests in "Existing tests to update". Verify: they fail
   for the reason stated.
3. <What changes> — <path: symbol>. Verify: <tests that now pass>.
<Refactoring, only if the user asked for it, comes last. Verify: every test still passes.>

## Risks and rollback
<What else could break — data, APIs, other modules, deployment — and how to undo the change.>

## Stop and re-plan if
<Findings during implementation that would make this plan wrong.>
```
