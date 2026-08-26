import { NextRequest, NextResponse } from "next/server";
import { runRecoverySimulation } from "@/lib/simulation/simulationEngine";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let workspaceId = user?.workspaceId;

    if (!workspaceId) {
      const firstWs = await db.workspace.findFirst();
      if (!firstWs) {
        return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
      }
      workspaceId = firstWs.id;
    }

    const body = await req.json().catch(() => ({}));
    const sampleSize = body.sampleSize || 500;

    const result = await runRecoverySimulation(workspaceId, sampleSize);

    return NextResponse.json({
      success: true,
      simulation: result,
    });
  } catch (error: any) {
    console.error("Simulation run error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute simulation" }, { status: 500 });
  }
}
