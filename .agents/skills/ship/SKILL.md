---
name: ship
description: >-
    Take finished work from the working tree to shipped in one move: commit it, rebase onto origin/main, run the QA
    checks and a local review, then push to main. Use whenever the user wants to "ship", "ship it", "commit and push
    this", "push this", "get this reviewed", "it's ready", or invokes `/ship`. Reach for it the moment the user says a
    chunk of work is finished, before looking at the changes yourself: it reads the state itself.
metadata:
    template-revision: "6"
---

# Ship

Gets finished work shipped with as little ceremony as possible: the safe, conventional choices (what to commit, commit message) are made automatically, so the user goes from a dirty working tree to a shipped change in one invocation.

**Operating principle:** decide and act, don't interrogate. Stop and ask only for the judgment calls the user must own: a secret inside the change, files that look unrelated to the change, a rebase conflict, a check that fails for a reason the change didn't cause or that you couldn't fix, or a review finding that needs a product decision.

This project ships **by committing straight to `main`**: no feature branches, no pull requests. A push to `main` is the release, so the checks and the review happen before it.

## Step 1: Read the current state

```sh
git branch --show-current
git status --short --branch
git log --oneline -5
```

If the tree is clean and nothing is unpushed, the work is already shipped, or there is none: go to the edge cases at the end instead of the steps below.

## Step 2: Branch

Stay on `main`. If you are on another branch, ask the user: don't merge or rebase it into `main` on their behalf. Detached HEAD: stop and ask them to check out a branch.

## Step 3: Commit

**Keep the change coherent.** Look at the changed files. If some clearly don't belong to the same change as the rest (a fix to one feature plus an unrelated CI edit), ask whether to include them. The default is one coherent change per ship.

**Keep secrets out.** Never stage a file of local secrets (`.env` and its variants, `.dev.vars`, private keys, credential files) unless the user asks for it: leave it out without asking, and say so in the report. Stop and ask only when a secret is inside what you would otherwise commit: a token, key or password in a changed or new file that belongs to the change. The repository is public.

**Tidy** happens on commit: the `pre-commit` hook formats staged files with oxfmt, and the `commit-msg` hook runs commitlint. Run nothing extra.

**Self-review** what you are about to commit against [docs/PRE_PR_REVIEW.md](../../../docs/PRE_PR_REVIEW.md): the "Always" list plus the sections matching what you touched. Do it before committing, so a fix is just another edit rather than an amend. If something you find is a settled convention rather than a defect, it belongs in [docs/KNOWN_NON_ISSUES.md](../../../docs/KNOWN_NON_ISSUES.md).

**Commit** with the `commit` skill if it is available: it checks the identity, scans for secrets, and splits the work into focused commits. Tell it the message convention below. If nothing is pending and `main` already has unpushed commits, skip committing.

Without the `commit` skill: stage by explicit path, never `git add -A`, keeping secrets out as above. Then commit with the convention below.

**Message convention:** Conventional Commits, `<type>(<scope>): <imperative summary>`, enforced by commitlint's conventional preset. `type` is `feat`, `fix`, `chore`, `build`, `refactor`, `docs`, `test` and so on, inferred from the diff; `scope` is the dominant area, and can be left out when there isn't one. Body lines stay at 100 characters or fewer. No ticket IDs.

## Step 4: Bring main up to date and check it

`git pull --rebase origin main`.

On a conflict, stop: report the conflicting files and ask how to proceed. Never guess a resolution.

**Check** what is about to ship with the checks below, after the rebase so they see the commits as they will land:

- **A failure the change caused:** fix it, commit the fix with step 3's rules, and run the checks again. If they still fail after two fixes, stop and ask.
- **A failure the change didn't cause** (a flaky test, something already broken on `main`): say why you think so, and ask whether to push anyway.
- Never skip, delete or loosen a test or a check to make it pass.

**Checks before pushing:** `bun run qa` (route types, lint, type check, and the tests once the project has them). There is no CI, so this is the only gate before the push.

## Step 5: Review before pushing

Once pushed, a commit is shipped, so the review happens here, on the commits about to go out. It comes after step 4 so it sees them exactly as they will land.

- **OCR review.** If the `ocr-review` skill is available, run it in local mode (`--local`) without asking. Skip it for docs-only commits or a very small, obvious change, and say so.
- **Address the findings.** If the review left open findings and the `address-pr-comments` skill is available, run it with `--local`. It shows a verdict table and waits for the user's confirmation, then commits the fixes without pushing. Otherwise, list the findings and ask whether to push anyway.
- **When the review scored 1 or 2,** don't push on the strength of the fixes alone: run `ocr-review --local --incremental` once on the fix commits, and if it still scores below 3, stop and ask.

One bounded pass: at most that one re-review, then go on to step 6.

## Step 6: Push

`git push origin main`, never forced. If it is rejected, run step 4 once more and retry, without reviewing again: the rebase only replayed commits step 5 already reviewed; if it is rejected again, stop and ask.

## Step 7: Report

Give the user the result plainly: the pushed commits, as a one-line recap of their subjects. Say which checks ran in step 4 and how they ended. Note what the review in step 5 found and what happened to each finding, any file left out of the commits and why, and anything left for the user to decide.

## Edge cases

- **Clean tree, already pushed.** Nothing to do but confirm: return the last pushed commit. Don't rebase, check or push it again.
- **Clean tree, nothing unpushed.** There's nothing to ship. Say so.
- **A review never arrived.** Deliver the result with the review noted as pending. Never imply a change is clean because no review came in.
