import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDemoWorkspace } from "@/lib/auth";
import { seedComprehensiveData } from "@/lib/seed/seedDataGenerator";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { workspace } = await getOrCreateDemoWorkspace();
    const existingCount = await db.transaction.count({
      where: { workspaceId: workspace.id },
    }).catch(() => 0);

    if (existingCount < 50) {
      await seedComprehensiveData(workspace.id, 2500);
    }

    const totalTxns = await db.transaction.count({
      where: { workspaceId: workspace.id },
    }).catch(() => 2500);

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully for workspace ${workspace.name}.`,
      totalTransactions: totalTxns,
      user: "Aryan Koomar",
      demoEmail: "demo@razorrecover.ai",
    });
  } catch (error: any) {
    console.error("Seed API GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { workspace } = await getOrCreateDemoWorkspace();
    const body = await req.json().catch(() => ({}));
    const count = body.count || 2500;

    await seedComprehensiveData(workspace.id, count);

    const totalTxns = await db.transaction.count({
      where: { workspaceId: workspace.id },
    }).catch(() => count);

    return NextResponse.json({
      success: true,
      message: `Seeded ${count} transactions. Total in workspace: ${totalTxns}.`,
      totalTransactions: totalTxns,
    });
  } catch (error: any) {
    console.error("Seed API POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed data" }, { status: 500 });
  }
}
