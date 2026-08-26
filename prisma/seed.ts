import { db } from "../lib/db";
import { getOrCreateDemoWorkspace } from "../lib/auth";
import { seedComprehensiveData } from "../lib/seed/seedDataGenerator";

async function main() {
  console.log("Initializing RazorRecover AI database and seed demo workspace...");
  const { user, workspace } = await getOrCreateDemoWorkspace();
  console.log(`Demo workspace created: ${workspace.name} (${workspace.id}) for user ${user.email}`);

  // Check if transactions already exist
  const existingCount = await db.transaction.count({
    where: { workspaceId: workspace.id },
  });

  if (existingCount < 100) {
    await seedComprehensiveData(workspace.id, 2500);
  } else {
    console.log(`Workspace already contains ${existingCount} transactions.`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
