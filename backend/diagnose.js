const fs = require('fs');
const path = require('path');

console.log("=== PRISMA CONNECTION DIAGNOSTIC ===");

// 1. Check current working directory
const cwd = process.cwd();
console.log(`Current Working Directory: ${cwd}`);

// 2. Check for multiple .env files
const checkEnvFile = (filePath) => {
  const fullPath = path.resolve(cwd, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`Found: ${filePath}`);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const dbUrlMatch = content.match(/^DATABASE_URL\s*=\s*(.*)$/m);
    if (dbUrlMatch) {
      console.log(`  -> Contains DATABASE_URL`);
      // Parse the URL safely
      try {
        let urlStr = dbUrlMatch[1].replace(/["']/g, '');
        // Hack to handle multiple @ signs in password if any, URL constructor might fail
        // Let's use URL constructor
        let parsed = new URL(urlStr);
        console.log(`  -> Host: ${parsed.hostname}`);
        console.log(`  -> Port: ${parsed.port}`);
        console.log(`  -> Username: ${parsed.username}`);
        console.log(`  -> Database: ${parsed.pathname.substring(1)}`);
      } catch (e) {
        console.log(`  -> Could not parse URL: ${e.message}`);
      }
    } else {
      console.log(`  -> No DATABASE_URL found in this file`);
    }
  } else {
    console.log(`Not found: ${filePath}`);
  }
};

console.log("\n--- Checking .env files ---");
checkEnvFile('.env');
checkEnvFile('.env.local');
checkEnvFile('../.env');
checkEnvFile('../.env.local');
checkEnvFile('prisma/.env');

console.log("\n--- Checking process.env ---");
if (process.env.DATABASE_URL) {
  console.log(`process.env.DATABASE_URL is SET.`);
  try {
    let parsed = new URL(process.env.DATABASE_URL);
    console.log(`  -> Host: ${parsed.hostname}`);
    console.log(`  -> Port: ${parsed.port}`);
    console.log(`  -> Username: ${parsed.username}`);
    console.log(`  -> Database: ${parsed.pathname.substring(1)}`);
  } catch (e) {
    console.log(`  -> Could not parse URL: ${e.message}`);
  }
} else {
  console.log(`process.env.DATABASE_URL is NOT set in the shell.`);
}

console.log("\n=== DIAGNOSTIC COMPLETE ===");
