import {
  CustomerContextOutput,
  DiagnosisOutput,
  RecoveryChannel,
  RecoveryStrategyType,
  ScoredStrategy,
  StrategyOutput,
} from "./types";

interface StrategyEvaluationInput {
  amount: number;
  paymentMethod: string;
  retryCount: number;
  diagnosis: DiagnosisOutput;
  customerContext: CustomerContextOutput;
}

export async function runRecoveryStrategyAgent(
  input: StrategyEvaluationInput
): Promise<StrategyOutput> {
  const { amount, diagnosis, customerContext, retryCount, paymentMethod } = input;
  const strategies: ScoredStrategy[] = [];

  // Strategy 1: SMART_RETRY (Immediate/Fast Intelligent Retry)
  let smartRetryProb = 0.2;
  if (diagnosis.failureCategory === "TRANSIENT_NETWORK") {
    smartRetryProb = retryCount === 0 ? 0.88 : retryCount === 1 ? 0.72 : 0.45;
  } else if (diagnosis.failureCategory === "AUTHENTICATION_TIMEOUT") {
    smartRetryProb = 0.65;
  } else if (diagnosis.failureCategory === "ISSUER_DOWNTIME") {
    smartRetryProb = 0.3; // Low if immediate, delayed is better
  } else if (diagnosis.failureCategory === "INSUFFICIENT_FUNDS" || diagnosis.failureCategory === "CARD_EXPIRED") {
    smartRetryProb = 0.05;
  }

  strategies.push({
    strategy: "SMART_RETRY",
    recommendedChannel: "API",
    recoveryProbability: Number(smartRetryProb.toFixed(2)),
    expectedValueINR: Number((amount * smartRetryProb).toFixed(2)),
    estimatedLatencyMinutes: 1,
    customerFrictionScore: 1,
    reasoning: "Background gateway token re-submission with adaptive backoff. Zero friction to customer.",
  });

  // Strategy 2: DELAYED_RETRY (Queue for banking switch recovery)
  let delayedRetryProb = 0.35;
  if (diagnosis.failureCategory === "ISSUER_DOWNTIME") {
    delayedRetryProb = 0.84;
  } else if (diagnosis.failureCategory === "TRANSIENT_NETWORK") {
    delayedRetryProb = 0.78;
  } else if (diagnosis.failureCategory === "INSUFFICIENT_FUNDS") {
    delayedRetryProb = 0.25; // Sometimes salary credit happens, but low
  }

  strategies.push({
    strategy: "DELAYED_RETRY",
    recommendedChannel: "API",
    recoveryProbability: Number(delayedRetryProb.toFixed(2)),
    expectedValueINR: Number((amount * delayedRetryProb).toFixed(2)),
    estimatedLatencyMinutes: 30,
    customerFrictionScore: 1,
    reasoning: "Scheduled silent retry after 30-45 minutes when issuer switch health metrics stabilize.",
  });

  // Strategy 3: PAYMENT_LINK (Dynamic Hosted One-Click Checkout Link)
  let paymentLinkProb = 0.6;
  if (diagnosis.failureCategory === "INSUFFICIENT_FUNDS") {
    paymentLinkProb = 0.76;
  } else if (diagnosis.failureCategory === "CARD_EXPIRED") {
    paymentLinkProb = 0.82;
  } else if (diagnosis.failureCategory === "AUTHENTICATION_TIMEOUT") {
    paymentLinkProb = 0.85;
  }
  if (customerContext.riskProfile === "VIP") paymentLinkProb += 0.08;

  strategies.push({
    strategy: "PAYMENT_LINK",
    recommendedChannel: customerContext.preferredChannel === "EMAIL" ? "EMAIL" : "WHATSAPP",
    recoveryProbability: Number(Math.min(0.95, paymentLinkProb).toFixed(2)),
    expectedValueINR: Number((amount * Math.min(0.95, paymentLinkProb)).toFixed(2)),
    estimatedLatencyMinutes: 15,
    customerFrictionScore: 2,
    reasoning: "Send instant branded Razorpay payment link with pre-populated order cart across WhatsApp/SMS.",
  });

  // Strategy 4: METHOD_RECOMMENDATION (Switch from failing Card/Bank to UPI or netbanking)
  let methodSwitchProb = 0.55;
  if (diagnosis.failureCategory === "ISSUER_DOWNTIME" || diagnosis.failureCategory === "CARD_EXPIRED") {
    methodSwitchProb = 0.86;
  } else if (paymentMethod === "CARD" && customerContext.preferredVpa) {
    methodSwitchProb = 0.89;
  }

  strategies.push({
    strategy: "METHOD_RECOMMENDATION",
    recommendedChannel: "IN_APP",
    recoveryProbability: Number(methodSwitchProb.toFixed(2)),
    expectedValueINR: Number((amount * methodSwitchProb).toFixed(2)),
    estimatedLatencyMinutes: 5,
    customerFrictionScore: 2,
    reasoning: `Prompt user to switch payment method to their primary verified VPA (${customerContext.preferredVpa || "UPI Auto-pay"}).`,
  });

  // Strategy 5: PERSONALIZED_REMINDER
  let reminderProb = 0.5;
  if (customerContext.contactFatigueRisk === "HIGH") {
    reminderProb = 0.2;
  } else if (amount > 10000) {
    reminderProb = 0.75;
  }

  strategies.push({
    strategy: "PERSONALIZED_REMINDER",
    recommendedChannel: "WHATSAPP",
    recoveryProbability: Number(reminderProb.toFixed(2)),
    expectedValueINR: Number((amount * reminderProb).toFixed(2)),
    estimatedLatencyMinutes: 60,
    customerFrictionScore: 3,
    reasoning: "Personalized WhatsApp nudge acknowledging checkout intent with quick payment CTA.",
  });

  // Strategy 6: ESCALATION (High value / high risk accounts)
  const isHighValue = amount >= 50000;
  const escalationProb = isHighValue || customerContext.riskProfile === "VIP" ? 0.91 : 0.4;
  strategies.push({
    strategy: "ESCALATION",
    recommendedChannel: "MANUAL_OPS",
    recoveryProbability: Number(escalationProb.toFixed(2)),
    expectedValueINR: Number((amount * escalationProb).toFixed(2)),
    estimatedLatencyMinutes: 120,
    customerFrictionScore: 4,
    reasoning: isHighValue
      ? "High-ticket payment (₹50k+) routed to Priority Concierge Desk for human agent outreach."
      : "Standard customer service ticket created for manual review.",
  });

  // Strategy 7: NO_ACTION (Fraud or permanent unrecoverable)
  if (diagnosis.failureCategory === "FRAUD_FLAG" || retryCount >= 3) {
    strategies.push({
      strategy: "NO_ACTION",
      recommendedChannel: "API",
      recoveryProbability: 0.0,
      expectedValueINR: 0.0,
      estimatedLatencyMinutes: 0,
      customerFrictionScore: 0,
      reasoning: "Suppress recovery actions to prevent fraud exposure or customer fatigue.",
    });
  }

  // Sort strategies by highest Expected Recovery Value while balancing friction
  const sorted = [...strategies].sort((a, b) => {
    // If high value, prefer highest probability
    if (amount > 50000 && a.strategy === "ESCALATION") return -1;
    if (amount > 50000 && b.strategy === "ESCALATION") return 1;
    return b.expectedValueINR - a.expectedValueINR;
  });

  const best = sorted[0];

  let rationale = "";
  if (best.strategy === "SMART_RETRY") {
    rationale = `Smart retry recommended because failure was diagnosed as ${diagnosis.failureCategory} with zero customer friction and estimated recovery probability of ${(best.recoveryProbability * 100).toFixed(0)}%.`;
  } else if (best.strategy === "DELAYED_RETRY") {
    rationale = `Delayed retry scheduled because issuer ${diagnosis.rootCause} is experiencing peak downtime. Expected probability: ${(best.recoveryProbability * 100).toFixed(0)}% upon bank health restoration.`;
  } else if (best.strategy === "PAYMENT_LINK") {
    rationale = `Dynamic payment link recommended via ${best.recommendedChannel} because original payment failed with ${diagnosis.failureCategory}. Customer ${customerContext.riskProfile} profile indicates high propensity to complete on alternate rail.`;
  } else if (best.strategy === "METHOD_RECOMMENDATION") {
    rationale = `Alternate payment rail recommendation triggered (${customerContext.preferredPaymentMethod}) avoiding failing gateway channel.`;
  } else if (best.strategy === "ESCALATION") {
    rationale = `Escalation to VIP Concierge Desk triggered due to high-value transaction of ₹${amount.toLocaleString("en-IN")}.`;
  } else {
    rationale = `Intervention ${best.strategy} prioritized by AI scoring engine.`;
  }

  return {
    chosenStrategy: best.strategy,
    recommendedChannel: best.recommendedChannel,
    recoveryProbability: best.recoveryProbability,
    expectedRecoveryINR: best.expectedValueINR,
    estimatedLatencyMinutes: best.estimatedLatencyMinutes || 5,
    primaryRationale: rationale,
    alternativeStrategies: sorted.slice(1),
  };
}
