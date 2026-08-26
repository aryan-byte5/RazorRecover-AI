import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  riskProfile: z.enum(["LOW", "MEDIUM", "HIGH", "VIP"]).optional(),
  preferredMethod: z.enum(["UPI", "CARD", "NETBANKING"]).optional(),
  preferredVpa: z.string().optional(),
  lifetimeValue: z.number().nonnegative().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await db.customer.findUnique({
      where: { id: params.id },
      include: {
        paymentMethods: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            recoveryCases: {
              include: {
                actions: true,
                outcomes: true,
              },
            },
          },
        },
        recoveryCases: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            transaction: true,
            aiDecisions: true,
            actions: true,
            outcomes: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const totalTransactions = customer.transactions.length;
    const successfulTxns = customer.transactions.filter((t) => t.status === "SUCCESS" || t.status === "RECOVERED");
    const failedTxns = customer.transactions.filter((t) => t.status === "FAILED");
    const recoveredTxns = customer.transactions.filter((t) => t.status === "RECOVERED");

    const totalRecoveredVolume = recoveredTxns.reduce((sum, t) => sum + t.amount, 0);
    const recoverySuccessRate = (recoveredTxns.length + failedTxns.length) > 0
      ? recoveredTxns.length / (recoveredTxns.length + failedTxns.length)
      : 0.8;

    return NextResponse.json({
      success: true,
      customer,
      metrics: {
        totalTransactions,
        successCount: successfulTxns.length,
        failureCount: failedTxns.length,
        recoveredCount: recoveredTxns.length,
        totalRecoveredVolume,
        recoverySuccessRate,
      },
    });
  } catch (error: any) {
    console.error("Get customer error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch customer profile" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const validated = UpdateCustomerSchema.parse(body);

    const updated = await db.customer.update({
      where: { id: params.id },
      data: validated,
    });

    if (user?.workspaceId) {
      await db.auditLog.create({
        data: {
          workspaceId: user.workspaceId,
          userId: user.id,
          actor: user.name || "ARYAN_KOOMAR_ADMIN",
          action: "CUSTOMER_UPDATED",
          entityType: "CUSTOMER",
          entityId: updated.id,
          details: `Customer ${updated.name} updated: ${JSON.stringify(validated)}`,
        },
      });
    }

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    console.error("Update customer error:", error);
    return NextResponse.json({ error: error.message || "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    await db.customer.delete({
      where: { id: params.id },
    });

    if (user?.workspaceId) {
      await db.auditLog.create({
        data: {
          workspaceId: user.workspaceId,
          userId: user.id,
          actor: user.name || "ARYAN_KOOMAR_ADMIN",
          action: "CUSTOMER_DELETED",
          entityType: "CUSTOMER",
          entityId: params.id,
          details: `Customer with ID ${params.id} deleted.`,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("Delete customer error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete customer" }, { status: 500 });
  }
}
