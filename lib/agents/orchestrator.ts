import { runPaymentDiagnosisAgent } from "./diagnosisAgent";
import { runCustomerContextAgent } from "./customerContextAgent";
import { runRecoveryStrategyAgent } from "./recoveryStrategyAgent";
import { evaluateGuardrails } from "./guardrailEngine";
import { executeRecoveryAction } from "./actionExecutor";
import { evaluateOutcome } from "./outcomeEvaluator";
import { AgentInvestigationFullResult } from "./types";
import { db } from "@/lib/db";

interface RunInvestigationParams {
  transactionId: string;
  autoExecute?: boolean;
  workspaceId?: string;
}

export async function runAutonomousInvestigation(
  params: RunInvestigationParams
): Promise<AgentInvestigationFullResult> {
  const startTime = Date.now();

  const transaction = await db.transaction.findUnique({
    where: { id: params.transactionId },
    include: {
      customer: true,
      workspace: {
        include: {
          settings: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new Error(`Transaction ${params.transactionId} not found`);
  }

  const workspaceSettings = transaction.workspace.settings;

  // Agent 1: Payment Diagnosis Agent
  const diagnosis = await runPaymentDiagnosisAgent({
    amount: transaction.amount,
    paymentMethod: transaction.paymentMethod,
    errorCode: transaction.errorCode,
    errorDescription: transaction.errorDescription,
    bankCode: transaction.bankCode,
    vpa: transaction.vpa,
    cardNetwork: transaction.cardNetwork,
    retryCount: transaction.retryCount,
  });

  // Agent 2: Customer Context Agent
  const customerContext = await runCustomerContextAgent({
    id: transaction.customer.id,
    name: transaction.customer.name,
    email: transaction.customer.email,
    phone: transaction.customer.phone,
    riskProfile: transaction.customer.riskProfile,
    lifetimeValue: transaction.customer.lifetimeValue,
    totalPayments: transaction.customer.totalPayments,
    successCount: transaction.customer.successCount,
    failureCount: transaction.customer.failureCount,
    preferredMethod: transaction.customer.preferredMethod,
    preferredVpa: transaction.customer.preferredVpa,
    lastContactedAt: transaction.customer.lastContactedAt,
  });

  // Agent 3: Recovery Strategy Agent
  const strategy = await runRecoveryStrategyAgent({
    amount: transaction.amount,
    paymentMethod: transaction.paymentMethod,
    retryCount: transaction.retryCount,
    diagnosis,
    customerContext,
  });

  // Agent 4: Guardrail Engine
  const guardrail = evaluateGuardrails({
    amount: transaction.amount,
    retryCount: transaction.retryCount,
    strategy,
    diagnosis,
    customerContext,
    settings: workspaceSettings || undefined,
  });

  let executionResult = undefined;
  let outcomeResult = undefined;

  // Find or create RecoveryCase
  let recoveryCase = await db.recoveryCase.findFirst({
    where: { transactionId: transaction.id },
  });

  if (!recoveryCase) {
    recoveryCase = await db.recoveryCase.create({
      data: {
        workspaceId: transaction.workspaceId,
        transactionId: transaction.id,
        customerId: transaction.customerId,
        status: guardrail.passed ? "DIAGNOSED" : "FAILED",
        priority: transaction.amount >= 50000 ? "CRITICAL" : transaction.amount >= 10000 ? "HIGH" : "MEDIUM",
        riskScore: customerContext.riskProfile === "HIGH" ? 0.8 : 0.25,
        recoveryProbability: strategy.recoveryProbability,
        expectedRecovery: strategy.expectedRecoveryINR,
        failureRootCause: diagnosis.rootCause,
        assignedStrategy: strategy.chosenStrategy,
        attemptCount: transaction.retryCount,
      },
    });
  } else {
    recoveryCase = await db.recoveryCase.update({
      where: { id: recoveryCase.id },
      data: {
        status: guardrail.passed ? "DIAGNOSED" : "FAILED",
        recoveryProbability: strategy.recoveryProbability,
        expectedRecovery: strategy.expectedRecoveryINR,
        failureRootCause: diagnosis.rootCause,
        assignedStrategy: strategy.chosenStrategy,
      },
    });
  }

  // Record AI Decision
  await db.aIDecision.create({
    data: {
      recoveryCaseId: recoveryCase.id,
      agentType: "FULL_ORCHESTRATION_PIPELINE",
      modelUsed: workspaceSettings?.aiProvider === "GEMINI" ? "gemini-1.5-flash" : "Deterministic-Expert-Engine-v2.6",
      diagnosedCause: diagnosis.rootCause,
      customerProfile: `${customerContext.riskProfile} | LTV ₹${customerContext.lifetimeValue}`,
      confidence: diagnosis.confidence,
      recommendedAction: strategy.chosenStrategy,
      reasoning: strategy.primaryRationale,
      policyCheckPassed: guardrail.passed,
      policyCheckDetails: guardrail.finalReason,
      metadataJson: JSON.stringify({ diagnosis, customerContext, strategy, guardrail }),
    },
  });

  // Record Audit Log: AI Diagnosed & Strategy Selected
  await db.auditLog.create({
    data: {
      workspaceId: transaction.workspaceId,
      transactionId: transaction.id,
      actor: "SYSTEM_AI",
      action: "AI_DIAGNOSED",
      entityType: "TRANSACTION",
      entityId: transaction.id,
      details: `AI Diagnosed ${diagnosis.failureCategory}: "${diagnosis.rootCause}" with ${(diagnosis.confidence * 100).toFixed(0)}% confidence. Selected strategy: ${strategy.chosenStrategy}.`,
      payloadJson: JSON.stringify({ diagnosis, strategy, guardrail }),
    },
  });

  // Execute action if autoExecute is requested and guardrails passed
  if (params.autoExecute && guardrail.passed) {
    const actionRecord = await db.recoveryAction.create({
      data: {
        recoveryCaseId: recoveryCase.id,
        actionType: strategy.chosenStrategy,
        channel: strategy.recommendedChannel,
        status: "EXECUTING",
        guardrailStatus: guardrail.status,
        guardrailReason: guardrail.finalReason,
        executedAt: new Date(),
      },
    });

    executionResult = await executeRecoveryAction({
      actionId: actionRecord.id,
      actionType: strategy.chosenStrategy,
      channel: strategy.recommendedChannel,
      transactionId: transaction.id,
      amount: transaction.amount,
      customerEmail: transaction.customer.email,
      customerPhone: transaction.customer.phone,
      customerName: transaction.customer.name,
    });

    outcomeResult = evaluateOutcome({
      amount: transaction.amount,
      strategy,
      execution: executionResult,
      failureCategory: diagnosis.failureCategory,
    });

    // Update Action status
    await db.recoveryAction.update({
      where: { id: actionRecord.id },
      data: {
        status: outcomeResult.isSuccessful ? "COMPLETED" : "FAILED",
        payloadDetails: JSON.stringify(executionResult.executedPayload),
      },
    });

    // Record Outcome
    await db.recoveryOutcome.create({
      data: {
        recoveryCaseId: recoveryCase.id,
        recoveryActionId: actionRecord.id,
        isSuccessful: outcomeResult.isSuccessful,
        recoveredAmount: outcomeResult.recoveredAmount,
        currency: "INR",
        latencyMs: outcomeResult.latencyMs,
        baselineWouldWin: outcomeResult.baselineWouldWin,
        outcomeNotes: outcomeResult.outcomeSummary,
        resolvedPaymentId: outcomeResult.isSuccessful ? `pay_rec_${Math.random().toString(36).substring(2, 9)}` : null,
      },
    });

    // Update Transaction & RecoveryCase state
    if (outcomeResult.isSuccessful) {
      await db.transaction.update({
        where: { id: transaction.id },
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

      // Update customer stats
      await db.customer.update({
        where: { id: transaction.customer.id },
        data: {
          successCount: { increment: 1 },
          lifetimeValue: { increment: transaction.amount },
          lastContactedAt: new Date(),
        },
      });

      // Audit Log for Recovery
      await db.auditLog.create({
        data: {
          workspaceId: transaction.workspaceId,
          transactionId: transaction.id,
          actor: "SYSTEM_AI",
          action: "OUTCOME_RECORDED",
          entityType: "RECOVERY_CASE",
          entityId: recoveryCase.id,
          details: `RECOVERY SUCCESS: ₹${transaction.amount.toLocaleString("en-IN")} settled via ${strategy.chosenStrategy}. Incremental lift: ₹${outcomeResult.incrementalValue.toLocaleString("en-IN")}.`,
          payloadJson: JSON.stringify(outcomeResult),
        },
      });
    } else {
      await db.transaction.update({
        where: { id: transaction.id },
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
          lastAttemptAt: new Date(),
        },
      });
    }
  }

  const totalProcessingMs = Date.now() - startTime;

  return {
    transactionId: transaction.id,
    amount: transaction.amount,
    customerName: transaction.customer.name,
    diagnosis,
    customerContext,
    strategy,
    guardrail,
    execution: executionResult,
    outcome: outcomeResult,
    aiModelUsed: workspaceSettings?.aiProvider === "GEMINI" ? "gemini-1.5-flash" : "Deterministic-Expert-Engine-v2.6",
    totalProcessingMs,
  };
}

export const runRecoveryOrchestrator = runAutonomousInvestigation;

