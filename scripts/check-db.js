#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load .env manually so we don't need dotenv
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith('#')) continue;
    const idx = s.indexOf('=');
    if (idx === -1) continue;
    let key = s.slice(0, idx).trim();
    let val = s.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

(async () => {
  try {
    const { PrismaClient } = require(path.join(process.cwd(), 'node_modules', '@prisma', 'client'));
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany();
    console.log('Found users:', users.length);
    console.log(JSON.stringify(users, null, 2));
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error querying DB:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
