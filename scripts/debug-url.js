#!/usr/bin/env node
// scripts/debug-url.js
// A Node.js diagnostic script to parse and verify DATABASE_URL syntax safely.

import { URL } from 'url';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('\x1b[31m[ERROR] DATABASE_URL environment variable is not defined.\x1b[0m');
  process.exit(1);
}

console.log('======================================================');
console.log('NODE.JS DATABASE_URL SYNTAX DIAGNOSTIC');
console.log('======================================================');
console.log(`Raw URL Length: ${dbUrl.length} characters`);

try {
  const parsed = new URL(dbUrl);
  
  console.log('\x1b[32m[SUCCESS] Node.js standard URL parser successfully parsed the connection string.\x1b[0m\n');
  console.log('Parsed Components:');
  console.log('------------------');
  console.log(`- Protocol:  ${parsed.protocol}`);
  console.log(`- Username:  ${parsed.username || '(None)'}`);
  
  if (parsed.password) {
    const maskedPass = parsed.password.substring(0, 2) + '*'.repeat(Math.max(0, parsed.password.length - 2));
    console.log(`- Password:  ${maskedPass} (Length: ${parsed.password.length} characters, masked)`);
  } else {
    console.log(`- Password:  (None)`);
  }
  
  console.log(`- Hostname:  ${parsed.hostname || '(None)'}`);
  console.log(`- Port:      ${parsed.port || '(Default for protocol)'}`);
  console.log(`- Pathname:  ${parsed.pathname || '(None)'}`);
  console.log(`- Search:    ${parsed.search || '(None)'}`);
  console.log(`- Hash:      ${parsed.hash || '(None)'}`);

  // Print a safe masked URL
  const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, (_, user, pass) => {
    return `//${user}:${pass.substring(0, 2)}${'*'.repeat(Math.max(0, pass.length - 2))}@`;
  });
  console.log(`\nSafe Masked Connection String:\n  ${maskedUrl}`);

  // Warn about unencoded characters
  if (parsed.password && (parsed.password.includes('@') || parsed.password.includes('#') || parsed.password.includes(':') || parsed.password.includes('/') || parsed.password.includes('?'))) {
    console.log('\n\x1b[33m[WARNING] Password contains raw special characters which could cause issues in some parsers.\x1b[0m');
  }

} catch (err) {
  console.error('\x1b[31m[FAIL] Node.js standard URL parser failed to parse DATABASE_URL.\x1b[0m');
  console.error(`Reason: ${err instanceof Error ? err.message : String(err)}`);
  
  // Lexical inspection to identify obvious problems
  console.log('\nManual Lexical Analysis:');
  console.log('------------------------');
  if (dbUrl.includes(' ')) {
    console.log('- WARNING: Connection string contains WHITESPACE characters.');
  }
  if (dbUrl.startsWith('"') || dbUrl.endsWith('"') || dbUrl.startsWith("'") || dbUrl.endsWith("'")) {
    console.log('- WARNING: Connection string is surrounded by QUOTES inside the variable.');
  }
  
  const protocolMatch = dbUrl.match(/^([^:]+):\/\//);
  if (protocolMatch) {
    console.log(`- Detected Protocol: ${protocolMatch[1]}`);
  } else {
    console.log('- WARNING: Missing or malformed protocol prefix (e.g. postgresql://).');
  }
}
console.log('======================================================\n');
