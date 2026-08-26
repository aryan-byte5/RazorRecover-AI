import test from "node:test";
import assert from "node:assert";
import { runPaymentDiagnosisAgent } from "../lib/agents/diagnosisAgent";
import { runCustomerContextAgent } from "../lib/agents/customerContextAgent";
import { runRecoveryStrategyAgent } from "../lib/agents/recoveryStrategyAgent";
import { evaluateGuardrails } from "../lib/agents/guardrailEngine";
import { executeRecoveryAction } from "../lib/agents/actionExecutor";
import { evaluateOutcome } from "../lib/agents/outcomeEvaluator";

test("Payment Diagnosis Agent correctly identifies ISSUER_DOWNTIME", async () => {
  const diagnosis = await runPaymentDiagnosisAgent({
    amount: 4999,
    paymentMethod: "UPI",
    errorCode: "GATEWAY_TIMEOUT",
    errorDescription: "HDFC Core Banking UPI Switch latency > 8000ms",
    bankCode: "HDFC",
    retryCount: 0,
  });

  assert.strictEqual(diagnosis.failureCategory, "ISSUER_DOWNTIME");
  assert.strictEqual(diagnosis.isTransient, true);
  assert.ok(diagnosis.confidence >= 0.85);
  assert.ok(diagnosis.evidence.length > 0);
});

test("Payment Diagnosis Agent correctly identifies INSUFFICIENT_FUNDS", async () => {
  const diagnosis = await runPaymentDiagnosisAgent({
    amount: 12000,
    paymentMethod: "CARD",
    errorCode: "INSUFFICIENT_FUNDS",
    errorDescription: "Customer account balance low",
    retryCount: 0,
  });

  assert.strictEqual(diagnosis.failureCategory, "INSUFFICIENT_FUNDS");
  assert.strictEqual(diagnosis.isTransient, false);
});

test("Customer Context Agent classifies VIP customer and assigns preferred channel", async () => {
  const context = await runCustomerContextAgent({
    id: "cust_123",
    name: "Vikram Malhotra",
    email: "vikram@example.com",
    phone: "+919833445566",
    riskProfile: "VIP",
    lifetimeValue: 185000,
    totalPayments: 20,
    successCount: 19,
    failureCount: 1,
    preferredMethod: "UPI",
    preferredVpa: "vikram@okaxis",
  });

  assert.strictEqual(context.riskProfile, "VIP");
  assert.strictEqual(context.historicalSuccessRate, 0.95);
  assert.strictEqual(context.preferredPaymentMethod, "UPI");
  assert.strictEqual(context.preferredChannel, "WHATSAPP");
});

test("Recovery Strategy Agent prioritizes PAYMENT_LINK on INSUFFICIENT_FUNDS", async () => {
  const diagnosis = await runPaymentDiagnosisAgent({
    amount: 5000,
    paymentMethod: "CARD",
    errorCode: "INSUFFICIENT_FUNDS",
    retryCount: 0,
  });

  const customerContext = await runCustomerContextAgent({
    id: "cust_456",
    name: "Priya Patel",
    email: "priya@example.com",
    riskProfile: "LOW",
    lifetimeValue: 30000,
    totalPayments: 5,
    successCount: 4,
    failureCount: 1,
  });

  const strategy = await runRecoveryStrategyAgent({
    amount: 5000,
    paymentMethod: "CARD",
    retryCount: 0,
    diagnosis,
    customerContext,
  });

  assert.strictEqual(strategy.chosenStrategy, "PAYMENT_LINK");
  assert.ok(strategy.recoveryProbability > 0.6);
  assert.ok(strategy.expectedRecoveryINR > 0);
});

test("Guardrail Engine blocks execution when max retries limit is exceeded", async () => {
  const diagnosis = await runPaymentDiagnosisAgent({
    amount: 2500,
    paymentMethod: "UPI",
    errorCode: "GATEWAY_TIMEOUT",
    retryCount: 3,
  });

  const customerContext = await runCustomerContextAgent({
    id: "cust_789",
    name: "Rohit Verma",
    email: "rohit@example.com",
    riskProfile: "LOW",
    lifetimeValue: 10000,
    totalPayments: 2,
    successCount: 1,
    failureCount: 1,
  });

  const strategy = await runRecoveryStrategyAgent({
    amount: 2500,
    paymentMethod: "UPI",
    retryCount: 3,
    diagnosis,
    customerContext,
  });

  const guardrail = evaluateGuardrails({
    amount: 2500,
    retryCount: 3,
    strategy,
    diagnosis,
    customerContext,
    settings: { maxRetries: 3 },
  });

  assert.strictEqual(guardrail.passed, false);
  assert.strictEqual(guardrail.status, "REJECTED");
});

test("Guardrail Engine flags high value transaction for VIP concierge escalation", async () => {
  const diagnosis = await runPaymentDiagnosisAgent({
    amount: 150000, // ₹1.5 Lakhs
    paymentMethod: "CARD",
    errorCode: "GATEWAY_TIMEOUT",
    retryCount: 0,
  });

  const customerContext = await runCustomerContextAgent({
    id: "cust_vip",
    name: "Ananya Iyer",
    email: "ananya@example.com",
    riskProfile: "VIP",
    lifetimeValue: 350000,
    totalPayments: 10,
    successCount: 10,
    failureCount: 0,
  });

  const strategy = await runRecoveryStrategyAgent({
    amount: 150000,
    paymentMethod: "CARD",
    retryCount: 0,
    diagnosis,
    customerContext,
  });

  const guardrail = evaluateGuardrails({
    amount: 150000,
    retryCount: 0,
    strategy,
    diagnosis,
    customerContext,
    settings: { humanReviewThreshold: 50000 },
  });

  assert.strictEqual(guardrail.status, "APPROVED"); // Handled via Escalation
});

test("Action Executor generates valid payload for SMART_RETRY", async () => {
  const execution = await executeRecoveryAction({
    actionId: "act_test_1",
    actionType: "SMART_RETRY",
    channel: "API",
    transactionId: "txn_test_1",
    amount: 2999,
    customerEmail: "user@example.com",
    customerName: "Aarav Sharma",
  });

  assert.strictEqual(execution.status, "COMPLETED");
  assert.strictEqual(execution.simulatedGatewayResponseCode, "RZP_PAYMENT_RECOVERY_SUCCESS");
  assert.ok(execution.executedPayload.backoffDelayMs > 0);
});

test("Outcome Evaluator computes correct financial recovery and incremental lift", async () => {
  const outcome = evaluateOutcome({
    amount: 5000,
    strategy: {
      chosenStrategy: "PAYMENT_LINK",
      recommendedChannel: "WHATSAPP",
      recoveryProbability: 1.0, // Force success
      expectedRecoveryINR: 5000,
      estimatedLatencyMinutes: 15,
      primaryRationale: "Test",
      alternativeStrategies: [],
    },
    execution: {
      actionId: "act_1",
      actionType: "PAYMENT_LINK",
      channel: "WHATSAPP",
      status: "COMPLETED",
      simulatedGatewayResponseCode: "SUCCESS_200",
      executedPayload: {},
      executionTimestamp: new Date().toISOString(),
    },
    failureCategory: "INSUFFICIENT_FUNDS",
  });

  assert.strictEqual(outcome.isSuccessful, true);
  assert.strictEqual(outcome.recoveredAmount, 5000);
  assert.strictEqual(outcome.incrementalValue, 5000);
});
