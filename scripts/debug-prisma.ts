// scripts/debug-prisma.ts
// A Prisma-specific diagnostic script to inspect the database datasource configuration and connection behavior safely.

import { PrismaClient } from '@prisma/client';

console.log('======================================================');
console.log('PRISMA CLIENT DATASOURCE DIAGNOSTIC');
console.log('======================================================');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('\x1b[31m[ERROR] DATABASE_URL environment variable is not defined.\x1b[0m');
  process.exit(1);
}

// Instantiate Prisma Client
// Note: We do not pass secrets or passwords directly to output.
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

console.log('[INFO] Attempting to initialize Prisma Client connection...');
console.log(`[INFO] Client version: ${(prisma as any)._clientVersion || 'Unknown'}`);

async function main() {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log('\x1b[32m[SUCCESS] Prisma Client connected to the database successfully!\x1b[0m');
    
    // Attempt a trivial query to confirm full read/write capability
    console.log('[INFO] Executing simple test query (SELECT 1)...');
    const result = await prisma.$queryRawUnsafe('SELECT 1 as test');
    console.log('\x1b[32m[SUCCESS] Database query returned successfully:\x1b[0m', result);
  } catch (err: any) {
    console.error('\x1b[31m[FAIL] Prisma failed to connect/initialize.\x1b[0m');
    console.error('Error Details:');
    console.error(`- Error Code: ${err.code || 'N/A'}`);
    console.error(`- Message:    ${err.message}`);
    
    if (err.code === 'P1013') {
      console.log('\n\x1b[33m[DIAGNOSTIC] P1013 indicates that the database URL could not be parsed by Prisma.\x1b[0m');
      console.log('This is a structural syntax error in the URL string, NOT a network or authentication failure.');
      console.log('This is 99% of the time caused by unencoded special characters in the database password (e.g., @, #, :, /, ?, etc.).');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
