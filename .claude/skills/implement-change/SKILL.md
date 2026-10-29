---
name: implement-change
description: Implement an approved plan from ai-workspace/changes/<change>/plan.md, test first. Adds the tests that protect existing behaviour and sees them pass, adds the new tests and sees them fail for the stated reason, then changes the code one plan step at a time under checkable code rules. Runs every static check and test the repo has. Fixes feedback items (a failed verify-change scenario or a review-change [Blocker]) the same way: a test that reproduces it first. Never assumes; asks the user and records each new decision in the plan. Does not commit. Use when asked to implement, build or fix something that has an approved plan, or to fix verifier or reviewer feedback on it.
metadata:
  owner: skpstg
  status: draft
---

## When to use

- To implement a fix or feature whose plan the user approved with plan-change.
- To fix a feedback item on such a change. See [Feedback items](#feedback-items).

## When NOT to use

- When there is no approved plan. Follow plan-change first.
- To commit, push or open a PR. The user asks for that when they are satisfied.

## Rules

- Follow the "No assumptions" and "Certainty" rules in the
  [writing rules](../_shared/writing-rules.md).
- Never make a decision yourself. While the plan answers everything, keep going. When you would
  have to assume something or choose between options the plan does not decide, stop and ask with
  your ask-the-user tool (`AskUserQuestion` in Claude Code). Present the options with evidence,
  mark the one you recommend and why, and wait for the answer.
- Change only what the plan's Steps name. Every changed line follows the [code rules](../_shared/code-rules.md).
- Never edit, skip or loosen a test to make it pass, unless the plan lists it under "Existing tests
  to update".
- Do not commit.

## Before starting

1. Find the change folder as the [workspace layout](../_shared/workspace.md) says, and read its
   `plan.md`. Its status must be `approved on <YYYY-MM-DD>`. If not, stop and tell
   the user to approve it or plan it with plan-change.
2. Read the code the plan's Context names, and `ai-workspace/context/README.md` with the docs it indexes that
   touch this change, if they exist.
3. Find every static check and test the repo has: test suites, linters, type checkers, formatter
   checks, build. Look in the package manifests, build files, CI config and pre-commit config. If
   how to run one is unclear, ask.
4. Run `git status` and record `git rev-parse HEAD` as the base commit. Run every check found in
   step 3 and record the result. If anything fails before you change a line, show the user and ask
   how to proceed.

## Steps

Follow the plan's Steps in order. After each step, run the tests it names and the tests from step
1. Do not start the next step until they pass.

1. **Protect existing behaviour.** Add each test in "Existing behaviour to protect" and run it.
   Each must pass on today's code. If one fails, today's behaviour is not what the plan says:
   re-plan.
2. **Add the new tests.** Add one test per scenario, named after it; Given, When and Then become
   arrange, act and assert. Update each test in "Existing tests to update". Run them. Each must
   fail with the reason in its "Fails today because". If it fails for another reason, such as an
   import error or a broken fixture, fix the test. If it passes, re-plan.
3. **Change the code.** One plan step at a time. Before adding a function, search the repo for one
   that already does it and reuse it. Write the least code that makes the step's tests pass.
   Check the step's diff against every [code rule](../_shared/code-rules.md).
4. **Refactor.** Only if the plan has a refactoring step. One change at a time, with no change to
   behaviour or tests. Every test passes after each change.
5. **Check everything.** Run every static check and test the repo has, as found in "Before
   starting". All must pass, apart from failures the user accepted before you started. Fix what
   your change broke; if the fix is not in the plan, re-plan.
6. **Report:** the base commit; per plan step, the files changed and each test's failing and then
   passing output; the result of every check; every re-plan and the decision recorded; anything
   you noticed but did not change. Do not commit. Tell the user the change is ready for them to
   review and commit.

## Feedback items

A feedback item is a failed scenario from verify-change or a
`[Blocker]` from review-change on a change made from the plan. Do
"Before starting", then for each item:

1. If its fix needs a file, behaviour or choice the plan does not cover, [Re-plan](#re-plan).
2. Add an automated test that reproduces it and see it fail for the reason the item gives. If the
   item is a plan scenario without a test, add that test. If it is a broken code rule, no test can
   reproduce it; go to step 3 with every test passing.
3. Then fix the code, as in Steps 3 and 5.
4. Report as in Step 6, per item instead of per plan step.

## Re-plan

Re-plan when anything in the plan's "Stop and re-plan if" happens, a test does not behave as the
plan says, or the work needs a file, behaviour or choice the plan does not cover.

1. Stop changing code.
2. Show the user what you found, with evidence, and the options. Ask with your ask-the-user tool and
   wait for the answer.
3. Update the plan: record the decision in `## Decisions`, and change the affected sections, such
   as tests, Context, Steps, and Risks and rollback. Add a line under the status:
   `Revised on <YYYY-MM-DD>: <what changed>`.
4. Continue from the step that stopped.

## Known failure modes

- Treating a small choice, like a name, an error type or where a helper goes, as not a decision. If
  neither the plan nor an existing convention settles it, ask.
- Making a failing test pass by changing the test instead of the code.
- Cleaning up code next to the change. It is out of scope unless the plan includes it.
