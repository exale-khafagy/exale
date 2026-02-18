# Fix push blocked by GitHub secret scanning

GitHub is blocking the push because commit `8cdca13` still contains secrets in **history**. You need to rewrite history so no commit ever contained those secrets.

**Close Cursor/VS Code first** so `.git/index.lock` is released, then run one of the options below.

---

## Easiest: One clean commit (recommended)

Replaces all history with a **single commit** containing your current (clean) code. No rebase, no stash.

```powershell
cd "d:\Exale 2026\Marketing Websites\Websites\exale-marketing"
powershell -ExecutionPolicy Bypass -File scripts/rewrite-clean-history.ps1
git push --force origin main
```

If you prefer to run the steps manually:

```powershell
cd "d:\Exale 2026\Marketing Websites\Websites\exale-marketing"

git checkout --orphan temp-main
git add -A
git commit -m "Initial monorepo deploy for Exale"
git branch -D main
git branch -m main
git push --force origin main
```

---

## Option A — Interactive rebase (recommended)

```powershell
cd "d:\Exale 2026\Marketing Websites\Websites\exale-marketing"

# 1. Start rebase and mark the first commit for editing
git rebase -i 8cdca13^

# 2. In the editor that opens, change the FIRST line from:
#    pick 8cdca13 Initial monorepo deploy for Exale
#    to:
#    edit 8cdca13 Initial monorepo deploy for Exale
# Save and close the editor.

# 3. When rebase stops at 8cdca13, replace the .env files with the clean versions (from your current HEAD):
git checkout fdc3649 -- apps/web/.env.example apps/api/.env.example

# 4. Amend the commit with the clean files
git add apps/web/.env.example apps/api/.env.example
git commit --amend --no-edit

# 5. Continue the rebase (the next commit may be empty and get skipped — that's OK)
git rebase --continue

# 6. If it says "The previous cherry-pick resulted in an empty commit", run:
#    git rebase --skip
# Then push:
git push --force-with-lease
```

## Option B — Root commit is the one with secrets

If `8cdca13` is your **first** commit (no parent), use this:

```powershell
cd "d:\Exale 2026\Marketing Websites\Websites\exale-marketing"

# 1. Stash the current (clean) .env example files so we can restore them during rebase
git stash push -m "clean env examples" apps/web/.env.example apps/api/.env.example

# 2. Start rebase from root; edit the first commit
git rebase -i --root

# 3. In the editor, change the first line from "pick" to "edit":
#    edit 8cdca13 Initial monorepo deploy for Exale
# Save and close.

# 4. When rebase stops, restore the clean .env files from the stash
git stash pop

# 5. Amend the commit with the clean files
git add apps/web/.env.example apps/api/.env.example
git commit --amend --no-edit

# 6. Continue (if it says empty commit, run: git rebase --skip)
git rebase --continue

# 7. Push
git push --force-with-lease
```

After either option, the push should succeed.
