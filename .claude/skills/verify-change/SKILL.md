---
name: verify-change
description: Verify a change to a web app the way a user would, in a real browser. Scopes the branch's changes since the default branch plus uncommitted ones, and the plan from plan-change if there is one. Writes a test plan of Given/When/Then scenarios, including a regression scenario for every user flow the changed code reaches, and gets it approved. Then runs each scenario through a code-blind tester subagent using Playwright CLI or agent-browser, with the user logging in by hand once, and records each run's results, with screenshots, in the change folder's round-<N>/verification.md. A later run for the same change re-runs the approved test-plan.md as a new round. Records how to run the app in ai-workspace/context/. Reports failures; never fixes them. Use when asked to verify, QA, acceptance-test or test a change like a user.
metadata:
  owner: skpstg
  status: draft
---

## When to use

- After changing a web app, usually with implement-change, to check
  the change works for a user in a real browser.

## When NOT to use

- For anything that is not a web app.
- To fix what fails. Failures go back to implement-change as
  feedback items.
- To write or run automated tests. That is part of implement-change.

## Rules

- Follow the "No assumptions" and "Certainty" rules in the
  [writing rules](../_shared/writing-rules.md).
- Never make a decision yourself. When something is unclear or you would have to choose, stop and
  ask with your ask-the-user tool (`AskUserQuestion` in Claude Code) and wait for the answer.
- Run only the scenarios in the test plan. Do not explore beyond them.
- Test only through a browser tool: Playwright CLI (`playwright-cli`) or `agent-browser`. Do not
  fall back to HTTP requests, scripts or reading the database to check a result.
- Never test against production.
- Never ask for, write or record a password or other secret. The user logs in themselves.
- Do not change code, tests or config. Write only the change folder's `test-plan.md` and
  `round-<N>/` files and, through update-codebase-docs, `ai-workspace/context/`. Paths follow the
  [workspace layout](../_shared/workspace.md). Keep the login state and the browser tool's
  files in the working folder outside the repo. Do not commit.

## Steps

1. **Find the changes.** Find the repo's default branch (ask if unsure) and its base:
   `git merge-base <default branch> HEAD`. The changes are `git diff <base>`, which covers commits
   on the branch and uncommitted changes, plus untracked files from
   `git ls-files --others --exclude-standard`. Find the change folder as the workspace layout says,
   and read its `plan.md` from plan-change if there is one. If there are no changes yet and the plan is approved, the changes are the files and
   symbols the plan's Context and Steps name; this lets the test plan be approved before any code
   changes.

   If the folder's `test-plan.md` has status `approved on`, reuse it.
   If a changed file is outside its Scope, do steps 2 to 4 for those files only, adding to the test plan. Then go to step 5 and
   re-run every scenario as a new round.
2. **Trace to users.** For each changed file and symbol, follow its callers, and
   `ai-workspace/context/change-maps.md` if present, until you reach a page or flow a user can open in the web app.
   Record each in Scope. List a change no page reaches as "not reachable from the UI". If a path is
   unclear, ask.
3. **Write the test plan.** If there is no change folder, create it as the workspace layout says.
   Start its `test-plan.md` from the [test plan template](test-plan-template.md), asking before
   overwriting an existing one. Add:
   - from the plan: each Given/When/Then scenario a user can see in the browser, as written. List
     the others in Scope as "not visible in the browser".
   - Regression: one scenario for each flow from step 2 that no plan scenario covers. Write its
     Given and When. Ask the user for the expected outcome of each, one at a time, and write it as
     the Then.

   For a Given a user cannot set up through the UI, such as seed data or a test account, ask how
   to set it up and record the documented route under "Setup outside the UI".
4. **Get approval.** Tell the user the test plan's path and summarise its scope and scenarios. Ask
   them to approve it or say what to change. Revise until they explicitly approve, then set its
   status to `approved on <YYYY-MM-DD>`.
5. **Prepare.**
   - Choose the browser tool: check `command -v playwright-cli` and `command -v agent-browser`. Use
     the one installed. If both or neither are, use Playwright CLI. If it is missing, show the user
     `npm install -g @playwright/cli@latest` (needs Node 18 or later). Run it only
     after the user approves. Do not fall back to anything else.
   - Create a working folder outside the repo with `mktemp -d`. Run every browser tool command from
     it, so files such as `.playwright-cli/` stay out of the repo. If you were given a working folder
     and login state from an earlier run of this change, reuse them and skip the login below.
   - Find how to start the app in `ai-workspace/context/README.md` "Run and test", the README and the package
     manifests. Ask if unclear. Ask which environment to use, and confirm it is not production.
   - Start the app so it keeps running after the command returns, for example
     `nohup <command> > <working folder>/app.log 2>&1 &`, and wait until its URL responds.
   - If a scenario needs a logged-in user, hand the login to the user. Open the login page in a
     visible browser: `playwright-cli -s=login open <login URL> --headed`. Ask the user with your
     ask-the-user tool to log in there and tell you when done. Then save the login:
     `playwright-cli -s=login state-save <working folder>/login-state.json`, and
     `playwright-cli -s=login close`. With agent-browser, use its equivalents from
     `agent-browser --help`.
   - Start `round-<N>/verification.md` from the template's Round results, with N as the workspace
     layout says, and fill in Environment.
   - Check you can delegate to a subagent that has your browser tool. If you cannot, set
     `Tester: main agent (not code-blind)` and follow [tester.md](tester.md) yourself.
6. **Run each scenario.** Send scenarios one scenario at a time, in order. For each:
   1. Do its setup outside the UI, if any, by its documented route.
   2. Send a new subagent the full text of [tester.md](tester.md), and only the scenario's
      Given/When/Then, the app's URL, the browser tool, the working folder, a session name, the
      login state file unless the Given says the user is logged out, and the absolute path of the
      screenshot folder `round-<N>/screenshots/`. Nothing about the code or the diff.
   3. Write its result into `round-<N>/verification.md` after each scenario, before starting the next one. If you
      could not send it, for example because its setup failed, mark it blocked with the reason.
7. **Report.** Stop the app. Delete the login state and the working folder. If you learned how to
   start the app, its URL, environment or a setup route, record it, never a secret: if
   the update-codebase-docs skill is installed, in the "Run and test" section of `ai-workspace/context/README.md`
   with it; otherwise in your report.
   Fill in the round's Summary and set its status to `run on <YYYY-MM-DD>`. Tell the user its path,
   how many scenarios passed, failed and were blocked, and each failure in one line. Failures go
   back to implement-change as feedback items.
   Do not change code. Do not commit.

## Known failure modes

- Checking a result with an API call or a database query when the browser is awkward.
- Writing a regression Then from what the code does instead of what the user said.
- Giving the tester hints from the code, such as selectors or internal names. It is then no longer
  code-blind.
