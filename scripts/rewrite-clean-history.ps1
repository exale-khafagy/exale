# Replace git history with one clean commit (no secrets in any commit).
# Run from repo root. Close Cursor/VS Code first to avoid .git/index.lock.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/rewrite-clean-history.ps1

Set-Location $PSScriptRoot\..

# Ensure no secrets in current .env.example
$line6 = (Get-Content "apps\web\.env.example" -TotalCount 6)[-1]
if ($line6 -match "sk_live_|sk_test_") {
    Write-Error "apps/web/.env.example still contains a secret on line 6. Remove it first."
    exit 1
}

Write-Host "Creating new branch with no history (current tree only)..."
git checkout --orphan temp-main
git add -A
git commit -m "Initial monorepo deploy for Exale"

Write-Host "Replacing main with clean history..."
git branch -D main
git branch -m main

Write-Host "Done. Push with: git push --force origin main"
Write-Host "Then delete remote backup if you had one: git push origin --delete temp-main 2>$null"
