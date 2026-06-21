$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
docker compose up -d --build
Write-Host "Backend disponible en http://localhost:8000"
