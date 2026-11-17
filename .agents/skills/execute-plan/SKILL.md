---
name: execute-plan
description: >-
    Execute an implementation plan written by `create-plan`, one phase at a time, with outside-in TDD and small
    commits, and archive it when the last phase is done. Handles boards (several numbered plans in one folder) by
    picking the next plan whose dependencies are done. Use whenever the user wants to execute, run, resume or continue
    a plan: `/execute-plan`, "execute the plan", "run the plan", "continue the plan", "work on the next phase", or when
    they point at a plan folder or file and ask to start implementing it. For creating a plan, use `create-plan`.
argument-hint: "[plan folder | plan file]"
metadata:
    template-revision: "2"
---

# Execute a plan

Carries out a plan from `create-plan`, phase by phase. Each phase is an end-to-end increment: when it's done, `bun run qa` passes, and the plan's checkboxes and ✅ markers say so.

**The critical rule:** execute only the **current phase** per invocation. When it's done, stop and ask before starting the next. Each phase stays atomic and reviewable.

Plans live in **`.agents/plans/`**, the plans folder. Completed plans are archived under its `done/` folder, which is never searched for an active plan.

## Step 1: Find the plan

| The user gave               | What to do                                                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A folder with `board.md`    | **Board mode:** show the board's checklist and propose the first unchecked plan whose dependencies are all checked. The user can pick another; if its dependencies aren't done, warn and let them go ahead anyway. |
| A folder with `plan.md`     | Execute `plan.md`.                                                                                                                                                                                                 |
| A path to a `.plan.md` file | Execute that plan. If its folder has a `board.md`, read it for context.                                                                                                                                            |
| A topic                     | List the plan folders (not `done/`), pick the best match, and confirm it.                                                                                                                                          |
| Nothing                     | List the plan folders (not `done/`) and ask which one.                                                                                                                                                             |

## Step 2: Find the current phase

The current phase is the **first** phase whose title doesn't end with ✅. Completed phases are never re-executed, amended or "cleaned up". If every phase is ✅ but the plan isn't archived yet, go to step 7.

The **Next step** section should agree. If it doesn't (it points at a phase already marked ✅), raise the inconsistency before going on.

Before starting the phase:

- **Open questions:** if **Open questions and risks** has `Open` items that affect this phase, list them and ask whether to resolve them now, defer them, or go ahead.
- **Phase metadata:** a `> Skills:` line names skills to load first. A `> Design:` line links the design for this phase: read it with the tools available before building UI.

## Step 3: Check the branch

The project commits straight to `main`: no feature branches, no pull requests, no tickets. Check you're on `main` (`git branch --show-current`). If you're on another branch, stop and ask. Uncommitted changes that belong to this plan mean you're resuming (see Edge cases); any others, ask about before starting.

This skill only commits. Pushing is `ship`'s job: it rebases onto `origin/main`, runs `bun run qa` and a local review, then pushes.

## Step 4: Execute the phase

Work through the phase's **TDD checklist** and **To-do** top to bottom, outside in, in baby steps:

1. For each behaviour change, bug fix or new feature step: write the failing test first, run it with `bun run test <file>`, and check it fails for the right reason. Write the minimum code to pass it, then refactor with the tests green. The kinds of test, in the order outside-in reaches them (details in `AGENTS.md`, Testing):
    - **Acceptance:** `<use-case>.acceptance.test.ts` next to the use case in `application/`, driving it through its input with the in-memory fakes from the slice's `infrastructure/`.
    - **Component:** `<component>.test.tsx` next to the component, with Testing Library in `happy-dom`, querying by role and label.
    - **Unit:** `<name>.test.ts` next to the piece, only where it deserves its own test; pure where possible.
    - **Contract:** when a port gets a real adapter, one shared suite that both the fake and the real adapter run.
2. Some to-dos need an extra step:
    - **`wrangler.jsonc` changes:** run `bun run cf-typegen` and commit the regenerated `cloudflare-env.d.ts` in the same commit.
    - **Caching, middleware, headers or bindings:** verify on `bun run preview` (the real Worker on `workerd`), not only `bun run dev`. See [FOOTGUNS.md](../../../docs/FOOTGUNS.md).
    - **New dependencies:** add them with `bun add` (or `bun add -d`) and commit `bun.lock` with them.
3. Commit **small, stable units**: one atomic change per commit, not one commit per phase.
4. Don't silently expand scope. If you find something the phase doesn't cover, raise it with the user instead of tacking it on.

**Check in on large phases.** With fewer than 5 to-dos, work straight through. With more, pause every 5 or so: summarise what's done (files changed, decisions made) and ask "Continue?".

## Step 5: Before each commit

The `pre-commit` hook formats the staged files and `commit-msg` runs commitlint, so neither needs running by hand.

- [ ] Lint the changed files: `bun run lint <files>`.
- [ ] Type-check the project: `bun run typecheck`.
- [ ] Run the tests you touched, not the whole suite: `bun run test <files>`.
- [ ] Update the plan file:
    - Tick the to-dos and TDD items this commit completes.
    - For each **Behaviour** rule a test in this commit proves, fill in its _proved by:_ with the test file and name.
    - Mark the phase title with ✅ only when every item in the phase is ticked.
    - Update **Next step** when you cross a to-do boundary or finish the phase.
- [ ] Commit the plan file together with the code: progress and code travel together.

Commit with the `commit` skill if it's available.

Messages follow Conventional Commits, enforced by commitlint: `<type>(<scope>): <imperative summary>`, with body lines of 100 characters or fewer.

If a check or test fails, fix it before committing; don't mark anything done until the phase's **Verify** items pass.

## Step 6: End of the phase: stop

When the phase title has its ✅:

1. Summarise the phase: the commits, the files touched, and any deviation from the plan.
2. Raise anything surprising: tests you had to rework, scope the plan didn't foresee, follow-ups for later phases. A follow-up the user agrees to defer goes in the plan's **Open questions and risks** as `Deferred`.
3. If this was the plan's last phase, go to step 7. Otherwise suggest `/ship` to push the phase, and **ask whether to start the next phase**; don't continue on your own. If the user agrees, go back to step 2.

## Step 7: End of the plan: archive

When every phase of the plan is ✅:

- **Single plan:** in the same commit that closes the last phase, move the plan's folder into `done/`, prefixed with today's date:

    ```sh
    git mv .agents/plans/<name> .agents/plans/done/$(date +%Y-%m-%d)-<name>
    ```

- **Board, other plans still open:** after the commit that closes the last phase, tick this plan on `board.md` in place, appending that commit's short sha, and commit the board on its own: `1. [x] ... | <short sha>`. Don't archive the folder yet. Show the updated board and suggest the next plan whose dependencies are done, ideally in a fresh session.
- **Board, this was the last plan:** tick it the same way, then move the whole board folder into `done/`, prefixed with today's date, in that same commit.

Use `git mv`, never `mv` or `rm`, so history records a rename. Then tell the user the plan is complete and where it was archived, and suggest `/ship`.

A completed plan found unarchived (every phase ✅, or every board item ticked) gets archived in a commit of its own.

## Edge cases

- **Plan not found:** list what's in the plans folder and ask.
- **Resuming mid-phase:** you're on `main` with uncommitted changes that belong to the current phase. Don't stash or discard anything: read the plan, work out which to-do you were on, and continue. Ask if unsure.
- **Several phases in one go:** confirm explicitly first. Even then, commit and ✅ each phase on its own.
- **The plan no longer matches the code** (someone already made a change): don't redo the work blindly. Raise the mismatch and ask how to reconcile it before editing anything.
