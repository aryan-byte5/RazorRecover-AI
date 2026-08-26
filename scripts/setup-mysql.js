/**
 * RazorRecover AI — Automated MySQL Setup & Migration Utility
 * Connects to your local MySQL database, creates the database schema,
 * and seeds Aryan Koomar's account and initial transaction data.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 ==============================================");
  console.log("   RazorRecover AI — MySQL Setup & Migration");
  console.log("==============================================\n");

  const mysqlHost = process.env.MYSQL_HOST || "localhost";
  const mysqlPort = process.env.MYSQL_PORT || "3306";
  const mysqlUser = process.env.MYSQL_USER || "root";
  const mysqlPassword = process.env.MYSQL_PASSWORD || "";
  const mysqlDatabase = process.env.MYSQL_DATABASE || "razorrecover";

  const passwordFlag = mysqlPassword ? `-p${mysqlPassword}` : "";

  console.log(`📡 Connecting to MySQL at ${mysqlHost}:${mysqlPort} as user '${mysqlUser}'...`);

  const sqlFile = path.join(__dirname, "../prisma/mysql_init.sql");

  try {
    // 1. Create Database & Schema via mysql CLI
    const cmd = `mysql -h ${mysqlHost} -P ${mysqlPort} -u ${mysqlUser} ${passwordFlag} < "${sqlFile}"`;
    console.log("⚙️  Executing MySQL DDL schema migration from prisma/mysql_init.sql...");
    execSync(cmd, { stdio: "inherit" });
    console.log("✅ MySQL tables, indexes, and foreign keys created successfully!");

    // 2. Update .env to use MySQL
    const envPath = path.join(__dirname, "../.env");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

    const mysqlUrl = `mysql://${mysqlUser}:${mysqlPassword}@${mysqlHost}:${mysqlPort}/${mysqlDatabase}`;
    if (envContent.includes("DATABASE_URL=")) {
      envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${mysqlUrl}"`);
    } else {
      envContent += `\nDATABASE_URL="${mysqlUrl}"\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Updated .env with MySQL connection URL: ${mysqlUrl}`);

    // 3. Seed Aryan Koomar user & data
    console.log("🌱 Seeding Aryan Koomar account & sample transactions to MySQL...");
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });

    console.log("\n🎉 MySQL Database Setup Complete!");
    console.log("   Your project is now storing all data permanently in MySQL.\n");
  } catch (err) {
    console.error("\n❌ MySQL Setup Notice:");
    console.log("If your local MySQL server requires a password, run:");
    console.log("   MYSQL_PASSWORD=your_password npm run setup:mysql\n");
    console.log("Or import 'prisma/mysql_init.sql' into MySQL Workbench, phpMyAdmin, or DBeaver.");
  }
}

main();
