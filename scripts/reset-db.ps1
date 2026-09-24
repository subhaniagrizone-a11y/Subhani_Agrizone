$ErrorActionPreference = 'Stop'
$projectRoot = Join-Path $PSScriptRoot '..'
Set-Location $projectRoot

if (-not $env:DATABASE_URL -and -not $env:MONGODB_URI) {
	throw 'Set DATABASE_URL or MONGODB_URI before running this destructive script.'
}

Write-Host 'Dropping database...'
node .\scripts\reset-db.js

Write-Host 'Syncing Prisma schema...'
npx prisma db push --accept-data-loss

Write-Host 'Seeding fresh data...'
npm run seed
