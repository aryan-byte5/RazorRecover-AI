import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let workspaceId = user?.workspaceId;

    if (!workspaceId) {
      const firstWs = await db.workspace.findFirst();
      if (!firstWs) return NextResponse.json({ logs: [], total: 0 });
      workspaceId = firstWs.id;
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const actor = searchParams.get("actor");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };

    if (action && action !== "ALL") {
      where.action = action;
    }

    if (actor && actor !== "ALL") {
      where.actor = actor;
    }

    if (search) {
      where.OR = [
        { details: { contains: search } },
        { entityId: { contains: search } },
        { action: { contains: search } },
      ];
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          transaction: {
            include: { customer: true },
          },
          user: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Audit logs API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
