$ErrorActionPreference = 'Stop'
$projectRoot = Join-Path $PSScriptRoot '..'
Set-Location $projectRoot

$env:DATABASE_URL = 'mongodb+srv://subhani:Asdfqwerty786%40@cluster0.kin3czy.mongodb.net/subhni_agrizone?retryWrites=true&w=majority&appName=Cluster0'

Write-Host 'Dropping database...'
node .\scripts\reset-db.js

Write-Host 'Syncing Prisma schema...'
npx prisma db push --accept-data-loss

Write-Host 'Seeding fresh data...'
npm run seed
