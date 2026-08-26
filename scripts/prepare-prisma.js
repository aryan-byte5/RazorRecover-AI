/**
 * RazorRecover AI — Intelligent Multi-Database Prisma Preparer
 * Automatically configures Prisma provider based on DATABASE_URL:
 * - postgresql:// or postgres:// -> PostgreSQL (Vercel, Neon, Supabase, AWS RDS)
 * - mysql:// -> MySQL (PlanetScale, AWS RDS, Local MySQL)
 * - file: or default -> SQLite (Local zero-config development)
 */

const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
let schemaContent = fs.readFileSync(schemaPath, "utf8");

const dbUrl = process.env.DATABASE_URL || "";

let targetProvider = "sqlite";
if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
  targetProvider = "postgresql";
} else if (dbUrl.startsWith("mysql://")) {
  targetProvider = "mysql";
} else {
  targetProvider = "sqlite";
}

console.log(`[Prisma Preparer] Configuring Prisma datasource provider for: ${targetProvider.toUpperCase()} (${dbUrl ? dbUrl.split(":")[0] + "://..." : "default local SQLite"})`);

// Replace datasource provider in schema.prisma
schemaContent = schemaContent.replace(
  /datasource\s+db\s+\{[\s\S]*?provider\s*=\s*"[^"]+"[\s\S]*?url\s*=\s*env\("DATABASE_URL"\)[\s\S]*?\}/,
  `datasource db {\n  provider = "${targetProvider}"\n  url      = env("DATABASE_URL")\n}`
);

fs.writeFileSync(schemaPath, schemaContent, "utf8");
console.log(`[Prisma Preparer] schema.prisma updated with provider = "${targetProvider}".`);
