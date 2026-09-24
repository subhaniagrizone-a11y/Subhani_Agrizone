#!/bin/bash

# Subhani Agrizone - Database & Development Scripts Guide

## Database Management Scripts

### 1. Test Database Connection

```bash
node scripts/test-connection.js
npm run db:test
```

**Purpose:** Verify MongoDB connection and view current data summary
**Use:** Before development or after connection issues

### 2. Clear All Data

```bash
node scripts/clear-all-data.js
npm run db:clear
```

**Purpose:** Delete all products, blog posts, orders, and related data
**Use:** Fresh start, data cleanup, testing

### 3. Prisma Studio

```bash
node scripts/prisma/studio.js
npm run db:studio
npm run prisma:studio
```

**Purpose:** Visual database management interface
**Use:** View, edit, and manage data graphically

### 4. Database Push

```bash
npm run db:push
```

**Purpose:** Sync Prisma schema with MongoDB
**Use:** After schema changes

### 5. Database Reset

```bash
npm run db:reset
```

**Purpose:** Drop database and recreate schema
**Use:** Full reset (destructive!)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Database Connection

**Cluster:** MongoDB Atlas - cluster0.kin3czy.mongodb.net
**Database:** subhni_agrizone
**Status:** ✅ Connected and Ready

## Data Structure

- **Users:** Authentication and user profiles
- **Products:** Agriculture product catalog
- **Orders:** Customer orders and transactions
- **Blog Posts:** Agriculture guides and articles
- **Categories:** Product categorization

All data is stored in MongoDB Atlas with automatic backups enabled.
