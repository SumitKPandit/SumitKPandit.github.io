# Writing rules

## No assumptions

- Never assume. If you are unsure about anything — a fact, what a term means, where a fact belongs,
  what the user wants — stop and ask the user before continuing.
- Ask with your ask-the-user tool (`AskUserQuestion` in Claude Code, `askQuestions` in Github Copilot) and wait for the answer. Only
  if you have no such tool, ask in chat and wait. Do not collect questions into a list for later.
- A subagent or workflow agent cannot reach the user. Instead of deciding, it stops and returns a
  Question block: the question, the options with the evidence for each, and the one it recommends
  and why. The agent that started it asks the user and passes the answer back.
- If the user cannot confirm a fact, leave it out.

## Certainty

- Only write facts you verified in this session, by reading the code they describe or running it.
  Names, comments and other docs are leads to check, not evidence.
- Cite the evidence: file path plus function, class or config key. Never a line number; line
  numbers go stale.
- A "why" needs a source: a commit message, PR, code comment or the user. Name the source. Never
  infer intent from the code.

## What is worth writing

- Write it only if someone new to the repo would get it wrong, or lose real time, without it.
- Leave out what a file listing, a package manifest or reading one file already tells them.
- Describe what exists. Do not recommend changes or judge the code.

## How to write it

- One fact, one home. Elsewhere, link to it instead of repeating it.
- Change the existing sentence or row instead of adding a new one.
- If you verified a statement is wrong, fix it or delete it. A shorter doc is a good outcome.
- Point to code by path and symbol. Do not copy code into docs.
- Keep the format of the file you are editing.
