import { NextRequest, NextResponse } from "next/server";
import { runAutonomousInvestigation } from "@/lib/agents/orchestrator";
import { runPaymentDiagnosisAgent } from "@/lib/agents/diagnosisAgent";
import { runCustomerContextAgent } from "@/lib/agents/customerContextAgent";
import { runRecoveryStrategyAgent } from "@/lib/agents/recoveryStrategyAgent";
import { evaluateGuardrails } from "@/lib/agents/guardrailEngine";
import { executeRecoveryAction } from "@/lib/agents/actionExecutor";
import { evaluateOutcome } from "@/lib/agents/outcomeEvaluator";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, customPayload, autoExecute } = body;

    // Mode 1: Investigate existing transaction
    if (transactionId) {
      const result = await runAutonomousInvestigation({
        transactionId,
        autoExecute: autoExecute !== false,
      });

      return NextResponse.json({ success: true, result });
    }

    // Mode 2: Interactive Playground / Custom Payload Investigation
    if (customPayload) {
      const startTime = Date.now();
      const {
        amount = 4999,
        paymentMethod = "UPI",
        errorCode = "GATEWAY_TIMEOUT",
        errorDescription = "HDFC UPI Switch response timed out",
        bankCode = "HDFC",
        vpa = "customer@okhdfcbank",
        customerName = "Priya Patel",
        customerEmail = "priya.p@example.com",
        customerPhone = "+919812345678",
        customerRisk = "LOW",
        customerLtv = 45000,
        retryCount = 0,
      } = customPayload;

      // Agent 1: Payment Diagnosis
      const diagnosis = await runPaymentDiagnosisAgent({
        amount,
        paymentMethod,
        errorCode,
        errorDescription,
        bankCode,
        vpa,
        retryCount,
      });

      // Agent 2: Customer Context
      const customerContext = await runCustomerContextAgent({
        id: "sandbox_cust_001",
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        riskProfile: customerRisk,
        lifetimeValue: customerLtv,
        totalPayments: 8,
        successCount: 7,
        failureCount: 1,
        preferredMethod: paymentMethod,
        preferredVpa: vpa,
      });

      // Agent 3: Strategy Agent
      const strategy = await runRecoveryStrategyAgent({
        amount,
        paymentMethod,
        retryCount,
        diagnosis,
        customerContext,
      });

      // Agent 4: Guardrail Engine
      const guardrail = evaluateGuardrails({
        amount,
        retryCount,
        strategy,
        diagnosis,
        customerContext,
      });

      let execution = undefined;
      let outcome = undefined;

      if (guardrail.passed) {
        execution = await executeRecoveryAction({
          actionId: `act_sandbox_${Date.now()}`,
          actionType: strategy.chosenStrategy,
          channel: strategy.recommendedChannel,
          transactionId: `txn_sandbox_${Date.now()}`,
          amount,
          customerEmail,
          customerPhone,
          customerName,
        });

        outcome = evaluateOutcome({
          amount,
          strategy,
          execution,
          failureCategory: diagnosis.failureCategory,
        });
      }

      const totalProcessingMs = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        result: {
          transactionId: "custom_sandbox_payload",
          amount,
          customerName,
          diagnosis,
          customerContext,
          strategy,
          guardrail,
          execution,
          outcome,
          aiModelUsed: "Deterministic-Fintech-Expert-v2.6",
          totalProcessingMs,
        },
      });
    }

    return NextResponse.json(
      { error: "Provide either transactionId or customPayload" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("AI Investigation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute AI investigation" },
      { status: 500 }
    );
  }
}
