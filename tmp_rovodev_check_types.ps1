Write-Host "Checking TypeScript types..." -ForegroundColor Cyan
node node_modules/typescript/lib/tsc.js --noEmit --pretty
$exitCode = $LASTEXITCODE
if ($exitCode -eq 0) {
    Write-Host "`nNo TypeScript errors found!" -ForegroundColor Green
} else {
    Write-Host "`nTypeScript errors detected (exit code: $exitCode)" -ForegroundColor Red
}
exit $exitCode
