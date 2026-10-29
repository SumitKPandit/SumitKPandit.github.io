# Test plan template

Keep every section. Write "None" when a section does not apply, so the reader knows it was
checked. Write scenarios in the user's words: what they see and click. No code, selectors or URLs a
user would not know. Never write a password or other secret.

The test plan, `test-plan.md` in the change folder:

```markdown
# Test plan: <Change title>
Status: draft | approved on YYYY-MM-DD
Plan: plan.md | None

## Scope
Base: <merge-base commit> on <default branch>. Head: <commit> plus uncommitted and untracked changes.
<Or, before any code changes: Planned from plan.md Context and Steps.>

| Changed file: symbol | Reaches the user through | Scenario |
|---|---|---|
<Every changed file and symbol. A change no page reaches says "not reachable from the UI" in the
second column. A plan scenario no user can see in the browser is listed here as "not visible in the
browser".>

## Scenarios

### 1. <Scenario name>
Source: plan story "<story title>" | regression: <user flow>
Setup outside the UI: <what to set up and the documented route, or None>

  Given <starting state>
  When <user action>
  Then <what the user sees>
```

# Round results

The results of one run, `round-<N>/verification.md` in the change folder:

```markdown
# Verification round <N>: <Change title>
Status: running | run on YYYY-MM-DD
Test plan: ../test-plan.md, approved on YYYY-MM-DD
Tester: subagent | main agent (not code-blind)

## Environment
URL: <app URL>
Started with: <command>
Browser tool and viewport: <playwright-cli | agent-browser>, <size>
Login: <handed to the user, logged in as <role> | not needed; never the password>

## Summary
| Scenario | Source | Result |
|---|---|---|
<One row per scenario. Filled in when the run ends.>

## Results

### 1. <Scenario name>
Result: pass | fail | blocked
Actual: <what was on screen at the Then, or where it stopped and why>
Steps to reproduce: <numbered user actions, for a failure; otherwise n/a>
Screenshot: <path under round-<N>/screenshots/, or "not saved: <reason>">
Reproduced on retry: yes | no | n/a
Evidence: <console errors and failed network requests, or None>
```
