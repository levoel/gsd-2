---
name: sync-fork
description: Sync this fork with upstream (gsd-build/gsd-2), merge latest changes, push, and rebuild the local global install. Use when asked to "sync", "merge upstream", "update fork", "pull from original", "обнови форк", "смерджи оригинал", or "rebuild gsd".
---

<essential_principles>
## Context

This repo (`levoel/gsd-2`) is a fork of `gsd-build/gsd-2`.
The global `gsd` CLI is installed via `npm link` from this directory, so a rebuild here updates the running tool.

**Upstream remote:** `upstream` → `https://github.com/gsd-build/gsd-2.git`
(may not exist yet — add it if missing)

**Two operations, usually run together:**
1. **sync** — fetch upstream, merge into our `main`, push to origin
2. **rebuild** — `npm run build` to update the globally-linked `gsd` CLI

Either can be run independently.
</essential_principles>

<routing>
Based on what the user asks:

- "sync", "merge upstream", "обнови форк", "смерджи оригинал" → **sync + rebuild** (both)
- "rebuild", "пересобери", "update install" → **rebuild only**
- "just sync, don't rebuild" → **sync only**

If unclear, do both — that's the common case.
</routing>

<process>
## Sync

1. **Ensure upstream remote exists:**
   ```bash
   git remote get-url upstream 2>/dev/null || git remote add upstream https://github.com/gsd-build/gsd-2.git
   ```

2. **Fetch upstream:**
   ```bash
   git fetch upstream
   ```

3. **Check divergence:**
   ```bash
   git log --oneline main..upstream/main   # what's new upstream
   git log --oneline upstream/main..main   # our local commits
   git rev-list --left-right --count main...upstream/main  # counts
   ```
   If `0` new upstream commits — report "already up to date" and skip merge.

4. **Dry-run conflict check:**
   ```bash
   git merge-tree $(git merge-base main upstream/main) main upstream/main 2>&1 | grep -c "<<<<<<" || true
   ```
   If conflicts detected — report them and ask the user how to proceed. Do NOT force-merge.

5. **Merge:**
   ```bash
   git merge upstream/main --no-edit
   ```

6. **Push:**
   ```bash
   git push origin main
   ```

7. **Report** what merged (count + notable commits).

## Rebuild

1. **Build:**
   ```bash
   npm run build
   ```
   Use `async_bash` — build takes ~25-30s.

2. **Verify:**
   ```bash
   gsd --version
   ```
   Confirm version matches `package.json`.

3. **Report** success and version.
</process>

<success_criteria>
- `git log` shows upstream commits merged into local `main`
- `origin/main` is up to date with local `main`
- `gsd --version` matches the version in `package.json`
- No merge conflicts left unresolved
</success_criteria>
