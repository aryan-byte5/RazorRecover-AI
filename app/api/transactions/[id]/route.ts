import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          include: {
            paymentMethods: true,
          },
        },
        recoveryCases: {
          include: {
            aiDecisions: { orderBy: { createdAt: "desc" } },
            actions: {
              include: { outcomes: true },
              orderBy: { createdAt: "desc" },
            },
            outcomes: { orderBy: { createdAt: "desc" } },
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error("Get transaction error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch transaction details" }, { status: 500 });
  }
}
