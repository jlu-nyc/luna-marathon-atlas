# Git Workflow

## Repository setup

1. Create a private GitHub repository named `luna-marathon-atlas`.
2. Add this project as the initial commit on `main`.
3. Protect `main` once regular feature work begins.

## Daily work

Create a short-lived branch for each coherent change:

```bash
git switch main
git pull
git switch -c feature/readiness-score
```

Before sharing or merging:

```bash
npm test
npm run typecheck
npm run build
```

Commit with a concise imperative message:

```bash
git add .
git commit -m "Add readiness score foundation"
git push -u origin feature/readiness-score
```

Open a pull request, review the diff, and merge only after checks pass.

## Collaborating with ChatGPT

For small changes, provide the relevant files or diff. For broad changes, upload or share a fresh archive from the current branch. Always state the branch or commit SHA used as the starting point so generated patches do not target stale code.

A useful request format is:

> Starting from commit `<sha>` on branch `<name>`, implement `<change>`. Preserve `<constraints>` and include tests.

## Versioning decisions

- Product and architecture decisions go in `docs/DECISIONS.md`.
- Future work belongs in GitHub issues and milestones.
- User-visible releases should be tagged once the app has stable milestones.
