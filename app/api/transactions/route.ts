import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { runAutonomousInvestigation } from "@/lib/agents/orchestrator";
import { DEMO_RECOVERY_CASES } from "@/lib/seed/demoFallbackStore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateTransactionSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("INR"),
  paymentMethod: z.enum(["UPI", "CARD", "NETBANKING"]),
  vpa: z.string().optional(),
  bankCode: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILED", "PENDING"]).default("FAILED"),
  errorCode: z.string().optional(),
  errorDescription: z.string().optional(),
});

const DEMO_TRANSACTIONS = DEMO_RECOVERY_CASES.map((c) => ({
  ...c.transaction,
  customer: c.customer,
  recoveryCases: [c],
}));

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let workspaceId = user?.workspaceId;

    if (!workspaceId) {
      const firstWs = await db.workspace.findFirst().catch(() => null);
      if (!firstWs) return NextResponse.json({ transactions: DEMO_TRANSACTIONS, total: DEMO_TRANSACTIONS.length, page: 1, totalPages: 1 });
      workspaceId = firstWs.id;
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const recoveryStatus = searchParams.get("recoveryStatus");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (method && method !== "ALL") {
      where.paymentMethod = method;
    }

    if (recoveryStatus && recoveryStatus !== "ALL") {
      where.recoveryStatus = recoveryStatus;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } },
        { vpa: { contains: search } },
      ];
    }

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        include: {
          customer: true,
          recoveryCases: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              aiDecisions: { take: 1, orderBy: { createdAt: "desc" } },
              actions: { take: 1, orderBy: { createdAt: "desc" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.transaction.count({ where }),
    ]);

    if (total === 0) {
      return NextResponse.json({
        transactions: DEMO_TRANSACTIONS,
        total: DEMO_TRANSACTIONS.length,
        page: 1,
        totalPages: 1,
      });
    }

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.warn("Transactions API fallback active:", error?.message);
    return NextResponse.json({
      transactions: DEMO_TRANSACTIONS,
      total: DEMO_TRANSACTIONS.length,
      page: 1,
      totalPages: 1,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let workspaceId = user?.workspaceId;

    if (!workspaceId) {
      const firstWs = await db.workspace.findFirst().catch(() => null);
      if (!firstWs) return NextResponse.json({ error: "No workspace found" }, { status: 404 });
      workspaceId = firstWs.id;
    }

    const json = await req.json();
    const validated = CreateTransactionSchema.parse(json);

    const customer = await db.customer.findFirst({
      where: { id: validated.customerId, workspaceId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found in this workspace" }, { status: 404 });
    }

    const failureCategory =
      validated.status === "FAILED"
        ? validated.errorCode === "INSUFFICIENT_FUNDS"
          ? "INSUFFICIENT_FUNDS"
          : validated.errorCode === "ISSUER_DOWN"
          ? "ISSUER_DOWNTIME"
          : "TRANSIENT_NETWORK"
        : null;

    const transaction = await db.transaction.create({
      data: {
        workspaceId,
        customerId: customer.id,
        amount: validated.amount,
        currency: validated.currency,
        paymentMethod: validated.paymentMethod,
        vpa: validated.vpa || (validated.paymentMethod === "UPI" ? customer.preferredVpa : null),
        bankCode: validated.bankCode,
        status: validated.status,
        errorCode: validated.errorCode,
        errorDescription: validated.errorDescription,
        failureCategory,
        recoveryStatus: validated.status === "FAILED" ? "QUEUED" : "NONE",
      },
      include: {
        customer: true,
      },
    });

    if (transaction.status === "FAILED") {
      try {
        await runAutonomousInvestigation({
          transactionId: transaction.id,
          workspaceId,
          autoExecute: true,
        });
      } catch (aiErr) {
        console.error("Auto recovery orchestrator error:", aiErr);
      }
    }

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: error.message || "Failed to create transaction" }, { status: 400 });
  }
}
