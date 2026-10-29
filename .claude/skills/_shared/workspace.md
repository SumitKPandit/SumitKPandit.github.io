# ai-workspace/

Everything these skills write goes under `ai-workspace/` at the repo root, so it never mixes with
docs other tools generate.

| Path | Holds | Written by |
|---|---|---|
| `ai-workspace/context/` | Docs about the codebase, for people and agents | map-codebase, update-codebase-docs |
| `ai-workspace/changes/<change>/plan.md` | The plan | plan-change; implement-change adds decisions |
| `ai-workspace/changes/<change>/test-plan.md` | The browser test plan | verify-change |
| `ai-workspace/changes/<change>/round-<N>/verification.md` | Results of verification run N, with `round-<N>/screenshots/` | verify-change |
| `ai-workspace/changes/<change>/round-<N>/review.md` | Review N | review-change |
| `ai-workspace/changes/<change>/delivery-log.md` | The delivery log | deliver-change |

## The change folder

`<change>` is `<TICKET>-<slug>` when the change has a ticket ID, such as `PROJ-123-export-csv`,
otherwise `<slug>`. The slug is short kebab-case. There is no date in the name, so a change keeps
one folder however many days it takes.

To find the folder for the change at hand, list `ai-workspace/changes/`. Match the ticket ID first,
then the slug. If more than one folder might be this change, ask which. If none matches, there is
no folder yet.

Create a folder only when your skill says to. Before creating one, ask the user for the change's
ticket ID. If the branch name contains one, such as `PROJ-123`, offer it as your recommended
answer. The user may say there is none.

## Rounds

Round N is the newest `round-<N>/` folder, or the next number if that folder already holds the file
you are writing. The first round is `round-1/`. So one round's verification and review sit
together, and a second run of the same skill starts a new round.
