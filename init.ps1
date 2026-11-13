# init.ps1 - verification entrypoint for the Umoja prototype.
# Test command: node scripts/verify.mjs
# Runs the project's own Node checks. ASCII only for Windows PowerShell 5.1.

$ErrorActionPreference = "Stop"

Write-Host "=== Umoja prototype verification ==="
& node scripts/verify.mjs
if ($LASTEXITCODE -ne 0) {
    throw "Verification failed with exit code $LASTEXITCODE"
}
Write-Host "=== Verification complete ==="
