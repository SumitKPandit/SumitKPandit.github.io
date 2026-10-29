# Code rules

Check every changed line against each rule, using `git diff <base commit>`. If a rule fails, fix
the line. If you cannot fix it without a choice the plan does not settle, ask the user.

| # | Rule | Check |
|---|---|---|
| 1 | Every changed hunk maps to a plan step. | Name the step for each hunk. Revert any hunk without one. |
| 2 | Follow the nearest existing convention for naming, error type, logging, imports and file layout: the same file first, then the same module, then the repo. | Name the existing code you followed. If two conventions conflict, ask. |
| 3 | Each function does one thing. | Describe it in one sentence without "and". |
| 4 | Names use the domain words in the plan's stories. Booleans read as questions, such as `isActive` or `hasAccess`. Use only abbreviations the repo already uses. | Compare each new name with the plan's wording. |
| 5 | A literal with meaning gets a named constant, placed with similar constants. | No unexplained number or string in the diff. |
| 6 | Validate input at the entry point where it enters the system: handler, CLI, message consumer. | Validation appears only at entry points. |
| 7 | Errors use the repo's existing error type, and the message names the operation, the identifier and the reason. Never swallow an error: no empty `catch`, and no `catch` that returns `null` or a default to hide the failure. Catch only what you handle. | Read every `catch`, `except` and `rescue` in the diff. |
| 8 | Change every place the plan's Context says the same rule lives, or reuse one shared copy. | Each place is in the diff or calls the shared copy. |
| 9 | No code for future needs: no unused parameter, option, flag or abstraction. | Every new symbol has a caller in the diff. |
| 10 | Nothing left behind: no commented-out code, debug output or TODO without a ticket. | Search the added lines for print and log calls, `debugger`, `TODO` and commented-out code. |
| 11 | A comment only explains a why the code cannot show, and names its source. | Each new comment cites a ticket, the plan or the user. |
| 12 | Do not touch code the plan does not change: no reformatting, renames or lint fixes, no hand edits to generated files, no lockfile change without a dependency change. | Every changed file is in the plan's Steps. |
| 13 | No new dependency unless the plan's Decisions record it. | Compare manifest changes with Decisions. |
| 14 | Handle preconditions, errors and edge cases first, with an early return, `continue` or throw, so the main path is not nested. | No function the diff adds, or whose nesting the diff deepens, nests blocks more than 2 levels deep inside its body. |
| 15 | A function that returns a value does not change its arguments or object state. A function that changes state, such as a database write, a state change or a call that changes another service, is not named like a query (`get`, `calculate`, `is`, `has`). | For each new or renamed function, list what it changes. |
| 16 | A helper with one caller lives next to that caller, not in a shared `utils` or base module. | Each new function in a shared module has callers in more than one module. |
