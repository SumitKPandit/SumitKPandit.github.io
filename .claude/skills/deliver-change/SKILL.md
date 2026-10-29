---
name: deliver-change
description: Deliver an approved plan end to end. Gets the browser test plan approved before any code changes, then loops implement-change (test first), verify-change (in a real browser) and review-change, sending failed scenarios and review Blockers back to the implementer, until the verifier and the reviewer both pass or 3 rounds are used, then hands to the user. Asks the user every decision. Records a delivery log in the change folder. Does not commit. Use when asked to deliver, build and verify, or take an approved plan to done. In Claude Code, /core:deliver-change-bg runs the same loop in the background.
metadata:
  owner: skpstg
  status: draft
---

## When to use

- After [plan-change](../plan-change/SKILL.md), when the user wants the whole loop run for them.
  implement-change, verify-change and review-change must be installed alongside this skill; it
  runs them.

## When NOT to use

- Without an approved plan. Follow [plan-change](../plan-change/SKILL.md) first.
- To run one stage. Use [implement-change](../implement-change/SKILL.md),
  [verify-change](../verify-change/SKILL.md) or [review-change](../review-change/SKILL.md) directly.
- To commit, push or open a PR. The user asks for that when they are satisfied.

## Rules

- Follow the "No assumptions" and "Certainty" rules in the
  [writing rules](../_shared/writing-rules.md).
- Never make a decision yourself. The plan, the approved test plan and these rules settle the loop.
  For anything else, ask with your ask-the-user tool (`AskUserQuestion` in Claude Code,
  `askQuestions` in GitHub Copilot) and wait. When a stage returns a Question block, ask the user,
  record the answer in the plan's `## Decisions`, and give it back to that stage.
- Only these go back to the implementer without the user: failed scenarios and `[Blocker]`
  findings. Ask the user about each `[Question]`; if the answer needs a change, it goes back too.
  Each `[Suggestion]` and `[Nit]` goes in the Delivery log for the user to decide.
- A round is one hand-off of feedback items from the verifier or the reviewer to the implementer.
  The two share one limit of 3 rounds.
- Do not commit.

## Before starting

1. Find the change folder as the [workspace layout](../_shared/workspace.md) says, and read its
   `plan.md`. Its status must be `approved on <YYYY-MM-DD>`. If not, stop and tell
   the user to approve it or plan it with [plan-change](../plan-change/SKILL.md).
2. Get the browser test plan approved before any code changes: follow
   [verify-change](../verify-change/SKILL.md) steps 1 to 4, which scope it from the plan. Skip this
   if the folder's `test-plan.md` is already approved. If verify-change finds no page reaches
   the change, browser verification is not applicable: note the reason and skip Verify below.
3. Start the folder's `delivery-log.md` in the format below.

## Steps

1. **Implement.** Follow [implement-change](../implement-change/SKILL.md) for the plan.
2. **Verify.** Follow [verify-change](../verify-change/SKILL.md). It re-runs the whole approved
   test plan. Give it the working folder and login state from the previous round, and leave its
   step 7 clean-up of them to step 5, so the user logs in once. Each failed scenario is a feedback
   item. If there is any, go to step 4.
3. **Review.** Follow [review-change](../review-change/SKILL.md). Each `[Blocker]` is a feedback
   item. If there is any, go to step 4. Otherwise go to step 5.
4. **Next round.** Write this round into the Delivery log. If 3 rounds are used, hand to the user:
   write what still fails and why under Result, and go to step 5. Otherwise give the feedback items
   to implement-change as in its Feedback items section, then go back to step 2.
   After every fix, verification re-runs the whole approved test plan, then the review runs again.
5. **Finish.** Delete the login state and the working folder. Write the last round and the Result
   into the Delivery log. Tell the user the result, the open findings and the delivery log's path. Do not
   commit.

## Delivery log

````markdown
# Delivery log
Browser verification: test-plan.md | not applicable: <reason>

## Round <n>
- Verifier: round-<N>/verification.md: <passed, failed and blocked counts; each failure in one line>
- Reviewer: round-<N>/review.md: <verdict; each [Blocker] in one line>
- Fixed: <each feedback item: the test that reproduces it, the files changed>

## Result
<Passed in round <n> | Handed to the user after 3 rounds: what still fails and why>
Open for the user: <each [Suggestion], [Nit] and unanswered [Question], or None>
````

## Background run

In Claude Code, `/core:deliver-change-bg` runs Steps in the background. Its agents cannot ask the
user, so all questions come before it starts or stop it.

1. Do Before starting. Then do verify-change step 5, Prepare, here: choose the browser tool, create
   the working folder, start the app and hand the login to the user.
2. Launch the workflow with `args`: `change` (the change folder's name), `web` (false when browser verification is not
   applicable), `tool`, `workDir`, `loginState` (or null) and `answers: []`.
3. When it returns `status: 'question'`, ask the user its Question block with your ask-the-user
   tool and record the answer in the plan's `## Decisions`. Then relaunch the same run with the
   same `args` and the answer added to the end of `answers`. Finished agents are reused.
4. When it returns `passed` or `handed off`, write its rounds into the Delivery log. Then do
   verify-change step 7's clean-up: stop the app, delete the login state and the working folder,
   and record how to run the app. Report as in step 5.

## Known failure modes

- Fixing a `[Suggestion]` or `[Nit]` because it is quick. The user decides those.
- Counting each scenario or finding as a round. A round is one hand-off, however many items it has.
- Verifying only the scenarios a fix touched instead of the whole approved test plan.
