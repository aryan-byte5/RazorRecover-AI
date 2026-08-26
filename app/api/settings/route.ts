import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    let workspaceId = user?.workspaceId;

    if (!workspaceId) {
      const firstWs = await db.workspace.findFirst();
      if (!firstWs) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
      workspaceId = firstWs.id;
    }

    let settings = await db.workspaceSettings.findUnique({
      where: { workspaceId },
    });

    if (!settings) {
      settings = await db.workspaceSettings.create({
        data: {
          workspaceId,
          maxRetries: 3,
          cooldownHours: 2,
          minRecoveryProbability: 0.35,
          enableWhatsAppReminders: true,
          enableSmsReminders: true,
          enableSmartSwitch: true,
          enableAutoLinks: true,
          quietHoursStart: 22,
          quietHoursEnd: 8,
          humanReviewThreshold: 50000.0,
          aiProvider: "DETERMINISTIC_EXPERT",
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let workspaceId = user?.workspaceId;

    if (!workspaceId) {
      const firstWs = await db.workspace.findFirst();
      if (!firstWs) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
      workspaceId = firstWs.id;
    }

    const body = await req.json();

    const updated = await db.workspaceSettings.upsert({
      where: { workspaceId },
      update: {
        maxRetries: body.maxRetries,
        cooldownHours: body.cooldownHours,
        minRecoveryProbability: body.minRecoveryProbability,
        enableWhatsAppReminders: body.enableWhatsAppReminders,
        enableSmsReminders: body.enableSmsReminders,
        enableSmartSwitch: body.enableSmartSwitch,
        enableAutoLinks: body.enableAutoLinks,
        quietHoursStart: body.quietHoursStart,
        quietHoursEnd: body.quietHoursEnd,
        humanReviewThreshold: body.humanReviewThreshold,
        aiProvider: body.aiProvider,
        geminiApiKey: body.geminiApiKey,
        openaiApiKey: body.openaiApiKey,
      },
      create: {
        workspaceId,
        maxRetries: body.maxRetries || 3,
        cooldownHours: body.cooldownHours || 2,
        minRecoveryProbability: body.minRecoveryProbability || 0.35,
        enableWhatsAppReminders: body.enableWhatsAppReminders ?? true,
        enableSmsReminders: body.enableSmsReminders ?? true,
        enableSmartSwitch: body.enableSmartSwitch ?? true,
        enableAutoLinks: body.enableAutoLinks ?? true,
        quietHoursStart: body.quietHoursStart || 22,
        quietHoursEnd: body.quietHoursEnd || 8,
        humanReviewThreshold: body.humanReviewThreshold || 50000.0,
        aiProvider: body.aiProvider || "DETERMINISTIC_EXPERT",
      },
    });

    // Record Audit Log for configuration update
    await db.auditLog.create({
      data: {
        workspaceId,
        actor: user?.name || "ADMIN",
        action: "SETTINGS_UPDATED",
        entityType: "WORKSPACE_SETTINGS",
        entityId: updated.id,
        details: "Updated AI recovery guardrails, quiet hours, and model provider settings.",
        payloadJson: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
