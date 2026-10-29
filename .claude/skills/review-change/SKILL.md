---
name: review-change
description: Review a change's code before it is committed or merged. Scopes the branch's changes since the default branch plus uncommitted ones, and the plan from plan-change if there is one. An independent reviewer subagent checks correctness against the plan and every line against the shared code rules, and verifies each finding. Reports tagged findings ([Blocker], [Suggestion], [Question], [Nit]) and a verdict in the chat, and saves them in the change folder's round-<N>/review.md when there is one. Never fixes anything. Use when asked to review or code-review a change, branch or diff.
metadata:
  owner: skpstg
  status: draft
---

## When to use

- After a change, usually after implement-change and
  verify-change, to review its code before it is committed or merged.

## When NOT to use

- To fix the findings. The user decides what to do with them, for example fixing them with
  implement-change.
- For style a linter or formatter catches.

## Rules

- Follow the "No assumptions" and "Certainty" rules in the
  [writing rules](../_shared/writing-rules.md).
- Never make a decision yourself. When something about the scope is unclear, stop and ask with your
  ask-the-user tool (`AskUserQuestion` in Claude Code) and wait for the answer. Doubts about the
  code's intent are `[Question]` findings for the author.
- Review against the [code rules](../_shared/code-rules.md) that implement-change follows.
  Do not add rules of your own.
- Report in the chat. If the change has a folder in the [workspace layout](../_shared/workspace.md),
  also save the report as its `round-<N>/review.md`. Write no other file, and post no PR comments
  unless the user then asks. Do not change code. Do not commit.

## Steps

1. **Find the changes.** Find the repo's default branch (ask if unsure) and its base:
   `git merge-base <default branch> HEAD`. The changes are `git diff <base>`, which covers commits
   on the branch and uncommitted changes, plus untracked files from
   `git ls-files --others --exclude-standard`. Count the changed lines: added plus removed lines
   from `git diff --numstat <base>`, plus the lines of each untracked file. Find the change folder as the
   workspace layout says, and use its `plan.md` from plan-change if there is one.
2. **Review.** Delegate to a subagent. Send it the full text of [reviewer.md](reviewer.md) and of
   the [code rules](../_shared/code-rules.md), the base commit and the plan's path, if
   there is one. Nothing else. If you cannot delegate, follow reviewer.md yourself and set
   `Reviewer: main agent (not independent)` in the report.
3. **Decide the verdict.** `REQUEST_CHANGES` if there is any `[Blocker]`. Otherwise `COMMENT` if
   there is any `[Question]`. Otherwise `APPROVE`.
4. **Report.** Write the review in the chat in this format, with findings grouped by file and most
   severe first:

   ````markdown
   ## Verdict: APPROVE | REQUEST_CHANGES | COMMENT
   - Size: <N> changed lines, <focused | over 400: consider splitting it>
   - Plan: <ai-workspace/changes/<change>/plan.md | none>
   - Reviewer: <subagent | main agent (not independent)>
   - Traced: <from the reviewer, or None>
   - Callers checked: <from the reviewer, or None>
   - Not checked: <from the reviewer, or None>

   <2–3 sentences: what the change does well and the main concerns.>

   ## Findings

   ### `path/to/file.ext` (lines X-Y)
   **[Tag] <issue>**
   *Reasoning:* <reasoning>
   *Suggested change:* <for a [Blocker], the before and after as code blocks>
   ````

   Write "No findings" when there are none. If the change has a folder, save the same text as
   `round-<N>/review.md`, with N as the workspace layout says.

## Known failure modes

- Flagging code the change did not touch.
- Reporting a finding the reviewer could not support with evidence.
- Flagging an alternative that works as well as the current code.
- Turning a doubt about intent into a `[Blocker]` instead of a `[Question]`.
