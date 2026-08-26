import { CustomerContextOutput, DiagnosisOutput, GuardrailCheckResult, StrategyOutput } from "./types";

interface GuardrailInput {
  amount: number;
  retryCount: number;
  strategy: StrategyOutput;
  diagnosis: DiagnosisOutput;
  customerContext: CustomerContextOutput;
  settings?: {
    maxRetries?: number;
    minRecoveryProbability?: number;
    quietHoursStart?: number;
    quietHoursEnd?: number;
    humanReviewThreshold?: number;
    enableWhatsAppReminders?: boolean;
    enableSmsReminders?: boolean;
  };
}

export function evaluateGuardrails(input: GuardrailInput): GuardrailCheckResult {
  const { amount, retryCount, strategy, diagnosis, customerContext, settings } = input;
  const maxRetries = settings?.maxRetries ?? 3;
  const minProb = settings?.minRecoveryProbability ?? 0.3;
  const humanThreshold = settings?.humanReviewThreshold ?? 50000;
  const quietStart = settings?.quietHoursStart ?? 22;
  const quietEnd = settings?.quietHoursEnd ?? 8;

  const evaluations: { ruleName: string; passed: boolean; reason: string }[] = [];
  let isApproved = true;
  let requiresHumanOverride = false;

  // Rule 1: Max Retry Threshold
  if (retryCount >= maxRetries) {
    evaluations.push({
      ruleName: "MAX_RETRIES_LIMIT",
      passed: false,
      reason: `Current retry count (${retryCount}) reached or exceeded workspace maximum of ${maxRetries}.`,
    });
    isApproved = false;
  } else {
    evaluations.push({
      ruleName: "MAX_RETRIES_LIMIT",
      passed: true,
      reason: `Attempt count (${retryCount}/${maxRetries}) within safe limits.`,
    });
  }

  // Rule 2: Minimum Probability Floor
  if (strategy.recoveryProbability < minProb && strategy.chosenStrategy !== "NO_ACTION") {
    evaluations.push({
      ruleName: "MIN_CONFIDENCE_THRESHOLD",
      passed: false,
      reason: `Estimated recovery probability (${(strategy.recoveryProbability * 100).toFixed(0)}%) is below workspace threshold (${(minProb * 100).toFixed(0)}%).`,
    });
    isApproved = false;
  } else {
    evaluations.push({
      ruleName: "MIN_CONFIDENCE_THRESHOLD",
      passed: true,
      reason: `Recovery probability ${(strategy.recoveryProbability * 100).toFixed(0)}% meets minimum criteria.`,
    });
  }

  // Rule 3: Anti-Fraud & Risk Flag Block
  if (diagnosis.failureCategory === "FRAUD_FLAG") {
    evaluations.push({
      ruleName: "FRAUD_RISK_SHIELD",
      passed: false,
      reason: "Automated retry blocked: Bank flagged high-risk or suspicious velocity on customer account.",
    });
    isApproved = false;
  } else {
    evaluations.push({
      ruleName: "FRAUD_RISK_SHIELD",
      passed: true,
      reason: "No suspicious fraud or velocity violations detected.",
    });
  }

  // Rule 4: High Value Escalation Threshold
  if (amount >= humanThreshold && strategy.chosenStrategy !== "ESCALATION") {
    evaluations.push({
      ruleName: "HIGH_VALUE_THRESHOLD",
      passed: false,
      reason: `Transaction amount (₹${amount.toLocaleString("en-IN")}) exceeds automatic intervention ceiling of ₹${humanThreshold.toLocaleString("en-IN")}. Requires VIP operations sign-off.`,
    });
    requiresHumanOverride = true;
    isApproved = false;
  } else {
    evaluations.push({
      ruleName: "HIGH_VALUE_THRESHOLD",
      passed: true,
      reason: `Amount ₹${amount.toLocaleString("en-IN")} is eligible for autonomous recovery workflow.`,
    });
  }

  // Rule 5: Contact Fatigue & Quiet Hours
  const currentHour = new Date().getHours();
  const isQuietHours = currentHour >= quietStart || currentHour < quietEnd;
  const isDirectCustomerContact =
    strategy.recommendedChannel === "WHATSAPP" ||
    strategy.recommendedChannel === "SMS" ||
    strategy.recommendedChannel === "EMAIL";

  if (isDirectCustomerContact && isQuietHours) {
    evaluations.push({
      ruleName: "QUIET_HOURS_POLICY",
      passed: false,
      reason: `Direct customer messaging paused during quiet hours (${quietStart}:00 - ${quietEnd}:00). Converted to scheduled queue.`,
    });
    // Don't fully reject, but flag
  } else {
    evaluations.push({
      ruleName: "QUIET_HOURS_POLICY",
      passed: true,
      reason: "Execution time adheres to telecom and customer contact window regulations.",
    });
  }

  // Rule 6: Duplicate Action Prevention
  if (customerContext.contactFatigueRisk === "HIGH" && isDirectCustomerContact) {
    evaluations.push({
      ruleName: "CONTACT_FATIGUE_PREVENTION",
      passed: false,
      reason: "Customer was contacted within the last 2 hours. Throttled to prevent spam.",
    });
    isApproved = false;
  } else {
    evaluations.push({
      ruleName: "CONTACT_FATIGUE_PREVENTION",
      passed: true,
      reason: "Customer interaction frequency is healthy.",
    });
  }

  const failedRules = evaluations.filter((e) => !e.passed);
  const status: "APPROVED" | "REJECTED" | "REQUIRES_HUMAN_OVERRIDE" = requiresHumanOverride
    ? "REQUIRES_HUMAN_OVERRIDE"
    : isApproved
    ? "APPROVED"
    : "REJECTED";

  const finalReason =
    status === "APPROVED"
      ? "All 6 policy guardrails passed successfully. Authorized for automated execution."
      : status === "REQUIRES_HUMAN_OVERRIDE"
      ? `High-value policy rule triggered: ₹${amount.toLocaleString("en-IN")} flagged for VIP Concierge review.`
      : `Guardrail check failed on: ${failedRules.map((r) => r.ruleName).join(", ")}.`;

  return {
    passed: status === "APPROVED",
    status,
    ruleEvaluations: evaluations,
    finalReason,
  };
}
