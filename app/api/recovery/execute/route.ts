import { NextRequest, NextResponse } from "next/server";
import { executeRecoveryAction } from "@/lib/agents/actionExecutor";
import { evaluateOutcome } from "@/lib/agents/outcomeEvaluator";
import { evaluateGuardrails } from "@/lib/agents/guardrailEngine";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recoveryCaseId, customStrategy, customChannel } = body;

    if (!recoveryCaseId) {
      return NextResponse.json({ error: "recoveryCaseId is required" }, { status: 400 });
    }

    const recoveryCase = await db.recoveryCase.findUnique({
      where: { id: recoveryCaseId },
      include: {
        customer: true,
        transaction: true,
        workspace: { include: { settings: true } },
      },
    });

    if (!recoveryCase) {
      return NextResponse.json({ error: "Recovery case not found" }, { status: 404 });
    }

    const strategyType = customStrategy || recoveryCase.assignedStrategy || "SMART_RETRY";
    const channel = customChannel || "API";

    // Create Action record
    const action = await db.recoveryAction.create({
      data: {
        recoveryCaseId: recoveryCase.id,
        actionType: strategyType,
        channel,
        status: "EXECUTING",
        guardrailStatus: "APPROVED",
        executedAt: new Date(),
      },
    });

    // Execute Simulated Recovery Action
    const execution = await executeRecoveryAction({
      actionId: action.id,
      actionType: strategyType,
      channel,
      transactionId: recoveryCase.transactionId,
      amount: recoveryCase.transaction.amount,
      customerEmail: recoveryCase.customer.email,
      customerPhone: recoveryCase.customer.phone,
      customerName: recoveryCase.customer.name,
    });

    // Evaluate Outcome
    const outcome = evaluateOutcome({
      amount: recoveryCase.transaction.amount,
      strategy: {
        chosenStrategy: strategyType,
        recommendedChannel: channel,
        recoveryProbability: recoveryCase.recoveryProbability,
        expectedRecoveryINR: recoveryCase.expectedRecovery,
        estimatedLatencyMinutes: 15,
        primaryRationale: "Manual / triggered execution",
        alternativeStrategies: [],
      },
      execution,
      failureCategory: recoveryCase.transaction.failureCategory || "TRANSIENT_NETWORK",
    });

    // Update Action status
    await db.recoveryAction.update({
      where: { id: action.id },
      data: {
        status: outcome.isSuccessful ? "COMPLETED" : "FAILED",
        payloadDetails: JSON.stringify(execution.executedPayload),
      },
    });

    // Record Outcome
    const outcomeRecord = await db.recoveryOutcome.create({
      data: {
        recoveryCaseId: recoveryCase.id,
        recoveryActionId: action.id,
        isSuccessful: outcome.isSuccessful,
        recoveredAmount: outcome.recoveredAmount,
        currency: "INR",
        latencyMs: outcome.latencyMs,
        baselineWouldWin: outcome.baselineWouldWin,
        outcomeNotes: outcome.outcomeSummary,
        resolvedPaymentId: outcome.isSuccessful ? `pay_rec_${Math.random().toString(36).substring(2, 9)}` : null,
      },
    });

    // Update Transaction & RecoveryCase
    if (outcome.isSuccessful) {
      await db.transaction.update({
        where: { id: recoveryCase.transactionId },
        data: {
          status: "RECOVERED",
          recoveryStatus: "RECOVERED",
          recoveredAt: new Date(),
        },
      });

      await db.recoveryCase.update({
        where: { id: recoveryCase.id },
        data: {
          status: "RECOVERED",
          resolvedAt: new Date(),
        },
      });

      await db.customer.update({
        where: { id: recoveryCase.customerId },
        data: {
          successCount: { increment: 1 },
          lifetimeValue: { increment: recoveryCase.transaction.amount },
          lastContactedAt: new Date(),
        },
      });

      // Audit Log
      await db.auditLog.create({
        data: {
          workspaceId: recoveryCase.workspaceId,
          transactionId: recoveryCase.transactionId,
          actor: "SYSTEM_AI",
          action: "OUTCOME_RECORDED",
          entityType: "RECOVERY_CASE",
          entityId: recoveryCase.id,
          details: `Manual intervention succeeded: ₹${recoveryCase.transaction.amount.toLocaleString("en-IN")} recovered via ${strategyType}.`,
          payloadJson: JSON.stringify(outcome),
        },
      });
    } else {
      await db.transaction.update({
        where: { id: recoveryCase.transactionId },
        data: {
          retryCount: { increment: 1 },
          recoveryStatus: "UNRECOVERABLE",
        },
      });

      await db.recoveryCase.update({
        where: { id: recoveryCase.id },
        data: {
          status: "FAILED",
          attemptCount: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      action: execution,
      outcome: outcomeRecord,
      recovered: outcome.isSuccessful,
    });
  } catch (error: any) {
    console.error("Execute recovery error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute recovery action" }, { status: 500 });
  }
}
