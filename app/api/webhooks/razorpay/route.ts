import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runAutonomousInvestigation } from "@/lib/agents/orchestrator";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    let eventData: any;
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { event, payload, contains } = eventData;
    const idempotencyKey = req.headers.get("x-idempotency-key") || eventData.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Fetch default or matched workspace
    const workspace = await db.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "No workspace available" }, { status: 500 });
    }

    // 2. Check Idempotency
    const existingEvent = await db.webhookEvent.findUnique({
      where: { idempotencyKey },
    });

    if (existingEvent) {
      return NextResponse.json({
        received: true,
        status: "DUPLICATE_IGNORED",
        message: "Event already processed under idempotency key",
      });
    }

    // 3. Store Webhook Event
    await db.webhookEvent.create({
      data: {
        workspaceId: workspace.id,
        provider: "RAZORPAY",
        eventType: event || "payment.failed",
        idempotencyKey,
        payload: rawBody,
        status: "PROCESSED",
      },
    });

    // 4. If payment.failed, extract details and trigger Autonomous Recovery
    if (event === "payment.failed" || event === "payment_failed") {
      const paymentEntity = payload?.payment?.entity || eventData;
      const amount = (paymentEntity.amount ? paymentEntity.amount / 100 : 4999);
      const email = paymentEntity.email || "customer@example.com";
      const contact = paymentEntity.contact || "+919876543210";
      const method = (paymentEntity.method || "upi").toUpperCase();
      const vpa = paymentEntity.vpa || (method === "UPI" ? "user@okhdfcbank" : null);
      const errorCode = paymentEntity.error_code || "GATEWAY_TIMEOUT";
      const errorDesc = paymentEntity.error_description || "Payment timed out at bank gateway";

      // Find or create customer
      let customer = await db.customer.findFirst({
        where: { workspaceId: workspace.id, email },
      });

      if (!customer) {
        customer = await db.customer.create({
          data: {
            workspaceId: workspace.id,
            name: paymentEntity.name || email.split("@")[0].toUpperCase(),
            email,
            phone: contact,
            riskProfile: "LOW",
            preferredMethod: method,
            preferredVpa: vpa,
          },
        });
      }

      // Create Failed Transaction
      const transaction = await db.transaction.create({
        data: {
          workspaceId: workspace.id,
          customerId: customer.id,
          externalId: paymentEntity.id || `pay_${Math.random().toString(36).substring(2, 11)}`,
          orderId: paymentEntity.order_id || `order_${Math.random().toString(36).substring(2, 11)}`,
          amount,
          currency: "INR",
          status: "FAILED",
          paymentMethod: method,
          vpa,
          errorCode,
          errorDescription: errorDesc,
          failureCategory: errorCode.includes("TIMEOUT") ? "TRANSIENT_NETWORK" : "ISSUER_DOWNTIME",
          recoveryStatus: "QUEUED",
        },
      });

      // Record Audit Log: Payment Failed
      await db.auditLog.create({
        data: {
          workspaceId: workspace.id,
          transactionId: transaction.id,
          actor: "WEBHOOK",
          action: "PAYMENT_FAILED",
          entityType: "TRANSACTION",
          entityId: transaction.id,
          details: `Webhook ingested: Razorpay payment ${transaction.externalId} failed (₹${amount.toLocaleString("en-IN")}, error: ${errorCode}).`,
          payloadJson: rawBody,
        },
      });

      // Dispatch AI Agent Orchestrator immediately
      const investigation = await runAutonomousInvestigation({
        transactionId: transaction.id,
        autoExecute: true,
      });

      return NextResponse.json({
        success: true,
        received: true,
        eventType: event,
        transactionId: transaction.id,
        aiInvestigation: investigation,
      });
    }

    return NextResponse.json({ received: true, eventType: event });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Webhook error" }, { status: 500 });
  }
}
