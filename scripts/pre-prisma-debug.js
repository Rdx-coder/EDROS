#!/usr/bin/env node
// scripts/pre-prisma-debug.js
// Forensic connection string inspector. Strictly non-interactive, zero info-leakage.

import { URL } from 'url';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('DATABASE_URL length: 0 (NOT DEFINED)');
  process.exit(0);
}

const len = dbUrl.length;
const beginsWithPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
const hasQuotes = dbUrl.startsWith('"') || dbUrl.endsWith('"') || dbUrl.startsWith("'") || dbUrl.endsWith("'");
const hasCarriageReturns = dbUrl.includes('\r');
const hasNewlines = dbUrl.includes('\n');

let host = 'N/A';
let port = 'N/A';
let dbName = 'N/A';
let passLen = 0;
let containsReserved = false;
let isAlreadyEncoded = false;

try {
  const parsed = new URL(dbUrl);
  host = parsed.hostname || 'N/A';
  port = parsed.port || '5432'; // Default PostgreSQL port
  dbName = parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'N/A';
  
  if (parsed.password) {
    passLen = parsed.password.length;
    // Reserved characters in URI: ! * ' ( ) ; : @ & = + $ , / ? # [ ]
    const decodedPass = decodeURIComponent(parsed.password);
    const reservedChars = /[\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]]/;
    containsReserved = reservedChars.test(decodedPass);
    isAlreadyEncoded = parsed.password !== decodedPass;
  }
} catch (err) {
  // Parsing failed in standard URL parser, let's do safe regex extraction
  const match = dbUrl.match(/^(?:postgresql|postgres):\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/([^?]+)/);
  if (match) {
    host = match[3];
    port = match[4] || '5432';
    dbName = match[5];
    const passwordPart = match[2];
    passLen = passwordPart.length;
    
    const decodedPass = decodeURIComponent(passwordPart);
    const reservedChars = /[\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]]/;
    containsReserved = reservedChars.test(decodedPass);
    isAlreadyEncoded = passwordPart !== decodedPass;
  }
}

console.log('======================================================');
console.log('DATABASE_URL FORENSIC DIAGNOSTICS:');
console.log('======================================================');
console.log(`DATABASE_URL length: ${len}`);
console.log(`Whether it begins with postgresql://: ${beginsWithPostgres}`);
console.log(`Whether it contains quotes: ${hasQuotes}`);
console.log(`Whether it contains carriage returns: ${hasCarriageReturns}`);
console.log(`Whether it contains newlines: ${hasNewlines}`);
console.log(`Hostname: ${host}`);
console.log(`Port: ${port}`);
console.log(`Database name: ${dbName}`);
console.log(`Password length: ${passLen}`);
console.log(`Whether password contains reserved URI characters: ${containsReserved}`);
console.log(`Whether the password is already URL encoded: ${isAlreadyEncoded}`);
console.log('======================================================');
