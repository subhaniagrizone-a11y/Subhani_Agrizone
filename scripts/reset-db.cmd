@echo off
set "DATABASE_URL=mongodb+srv://subhani:Asdfqwerty786%40@cluster0.kin3czy.mongodb.net/subhni_agrizone?retryWrites=true&w=majority&appName=Cluster0"
cd /d "%~dp0.."
node scripts\reset-db.js
npx prisma db push --accept-data-loss
npm run seed
