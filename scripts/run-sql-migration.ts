#!/usr/bin/env tsx
/**
 * scripts/run-sql-migration.ts
 * Runs a SQL migration file against Neon/Postgres database.
 *
 * Usage:
 *   npx tsx scripts/run-sql-migration.ts db/migrations/003_decision_lab_trading_params.sql
 *
 * Requires POSTGRES_URL environment variable.
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: npx tsx scripts/run-sql-migration.ts <migration-file.sql>');
  process.exit(1);
}

const migrationPath = path.resolve(process.cwd(), migrationFile);

if (!fs.existsSync(migrationPath)) {
  console.error(`Error: Migration file not found: ${migrationPath}`);
  process.exit(1);
}

const rawUrl = (process.env.POSTGRES_URL || '').trim();
if (!rawUrl) {
  console.error('Error: POSTGRES_URL environment variable is not set');
  process.exit(1);
}

let connStr = rawUrl;
if (connStr.startsWith('psql ')) {
  const m = connStr.match(/^psql\s+'(.+)'/);
  connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
}

const sql = neon(connStr);

async function runMigration() {
  try {
    console.log(`Reading migration file: ${migrationPath}`);
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Executing migration...');
    await sql(sqlContent);

    console.log('✓ Migration completed successfully');
  } catch (err: any) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
