@echo off
if "%DATABASE_URL%"=="" if "%MONGODB_URI%"=="" (
	echo Set DATABASE_URL or MONGODB_URI before running this destructive script.
	exit /b 1
)
cd /d "%~dp0.."
node scripts\reset-db.js
npx prisma db push --accept-data-loss
npm run seed
