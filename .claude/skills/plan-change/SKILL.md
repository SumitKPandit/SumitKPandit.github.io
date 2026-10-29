---
name: plan-change
description: Plan a bug fix or feature before any code changes, test first. Explores the code, records new facts in ai-workspace/context/, writes user stories with Given/When/Then scenarios and the failing and regression tests to add, gets them approved, then plans the code change. The user makes every decision; never assumes. Use when asked to plan a fix, a feature or any other code change.
metadata:
  owner: skpstg
  status: draft
---

## When to use

- Before fixing a bug or building a feature, when the user wants an agreed plan first.

## When NOT to use

- To implement. This skill ends when the user approves the plan.
- To document a codebase without a change in mind. Use map-codebase.

## Rules

- Follow the "No assumptions" and "Certainty" rules in the
  [writing rules](../_shared/writing-rules.md) for every fact in the plan.
- Never make a decision yourself. The user makes every decision: what the problem is, what "done"
  means, what is out of scope, which behaviour changes and which must stay, the direction of the
  fix or design, which approach, and how to test it. This holds even when there is only one option
  or you are confident. Present the options with evidence and trade-offs, mark the one you
  recommend and why, and ask with your ask-the-user tool (`AskUserQuestion` in Claude Code, `askQuestions` in Github Copilot). Wait
  for the answer.
- If anything is unclear or in doubt at any step, stop and ask before continuing.
- Tests come first. Do not discuss code changes until the user approves the stories and tests.
- Always plan to refactor only after the tests that protect existing behaviour and the tests for the new behaviour
  are in place, and only if the user asked for it.
- Do not change code, tests or config. Write only the change folder's `plan.md` and, through the
  docs skills, `ai-workspace/context/`. Paths follow the [workspace layout](../_shared/workspace.md).

## Before starting

- If `ai-workspace/context/README.md` exists, read it and the docs it indexes that touch this change. Use them as
  the starting map. Verify any statement before the plan relies on it.
- If it does not exist and the map-codebase skill is installed, ask the user whether to run
  map-codebase first or plan without docs. If they choose map-codebase, follow it, then continue
  here. If it is not installed, plan without docs.

## Steps

1. **Understand the request.** Restate the problem in your own words: for a bug, what happens,
   what should happen and how to reproduce it; for a feature, who needs what and why. Ask the user
   to confirm it, what "done" means and what is out of scope.
2. **Explore.** Read the code involved. Delegate an area to a subagent where available; it returns
   facts with evidence and its doubts, and writes nothing. Find:
   - for a bug, the root cause. Reproduce it by running the code or an existing test where you
     can. A symptom is not a cause.
   - for a feature, where it fits and the existing code to reuse
   - every other place the same rule lives, and its callers (see `ai-workspace/context/change-maps.md` if present)
   - every existing behaviour the change touches, and the tests that cover each one, or "no test"
   - what else the change could break: data, APIs, other modules, deployment

   Note each verified, non-obvious fact that `ai-workspace/context/` is missing or gets wrong.
3. **Record the new facts.** If `ai-workspace/context/README.md` exists and
   the update-codebase-docs skill is installed, follow it with them.
   Otherwise list them in your final report, and if `ai-workspace/context/README.md` does not exist, suggest
   `/map-codebase`.
4. **Write the stories and tests.** Show the user the behaviours the change touches, split into
   those the requirement changes and those that must stay, and ask them to confirm the split. Then
   find the change folder as the [workspace layout](../_shared/workspace.md) says. If there is none,
   create it, asking for the ticket ID as the layout says. Start its `plan.md` from the
   [plan template](plan-template.md), asking before overwriting an existing one. Fill in Problem, Done when, Out of scope and User
   stories and tests:
   - a user story for each capability; for a bug, a story for the correct behaviour
   - Given/When/Then scenarios for each story, covering the normal case, edge cases and errors.
     For a bug, one scenario reproduces it. Each scenario is one test that fails today.
   - for each behaviour that must stay and has no test, a test that passes on today's code
   - existing tests that assert behaviour the requirement changes, and their new expectation

   Describe tests by behaviour, not by implementation, so they hold whichever approach is chosen.
   Ask the user to approve this section and record the date in it.
5. **Choose the direction.** Show the user each viable approach with its evidence, trade-offs and
   what it touches, and ask them to choose. If you found only one, say why the others fail and ask
   them to confirm it.
6. **Finish the plan:** Decisions, Context, Steps, Risks and rollback, Stop and re-plan if. Order
   the steps: add the tests that protect existing behaviour and run them to see them pass; add the
   new tests and run them to see them fail for the expected reason; change the code until every
   test passes; then refactor, if the user asked for it, keeping every test passing. Every
   statement is a verified fact with evidence or a decision the user made. If writing the plan
   raises a choice the user has not made, stop and ask.
7. **Get approval.** Tell the user the plan's path and summarise it. Ask them to approve it or say
   what to change. Revise until they explicitly approve, then set its status to
   `approved on <YYYY-MM-DD>`.
8. **Report:** the plan's path, the docs you changed, and any facts you listed for later.
   Do not implement. Do not commit.

## Known failure modes

- Treating a cheap or obvious choice as not a decision. If it shapes the change, ask.
- Writing tests against the planned implementation instead of the behaviour, so they must be
  rewritten when the approach changes.
