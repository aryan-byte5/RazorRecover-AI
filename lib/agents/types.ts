export type FailureCategory =
  | "TRANSIENT_NETWORK"
  | "INSUFFICIENT_FUNDS"
  | "AUTHENTICATION_TIMEOUT"
  | "ISSUER_DOWNTIME"
  | "CARD_EXPIRED"
  | "FRAUD_FLAG"
  | "LIMIT_EXCEEDED"
  | "INVALID_VPA"
  | "UNKNOWN_ERROR";

export type RecoveryStrategyType =
  | "SMART_RETRY"
  | "METHOD_RECOMMENDATION"
  | "PAYMENT_LINK"
  | "PERSONALIZED_REMINDER"
  | "DELAYED_RETRY"
  | "ESCALATION"
  | "NO_ACTION";

export type RecoveryChannel = "API" | "WHATSAPP" | "SMS" | "EMAIL" | "IN_APP" | "MANUAL_OPS";

export interface DiagnosisOutput {
  failureCategory: FailureCategory;
  rootCause: string;
  isTransient: boolean;
  downtimeProbability: number;
  confidence: number;
  evidence: string[];
}

export interface CustomerContextOutput {
  customerId: string;
  riskProfile: "LOW" | "MEDIUM" | "HIGH" | "VIP";
  historicalSuccessRate: number;
  lifetimeValue: number;
  preferredChannel: RecoveryChannel;
  preferredPaymentMethod: string;
  preferredVpa?: string;
  contactFatigueRisk: "LOW" | "MEDIUM" | "HIGH";
  responsivenessScore: number; // 0 to 1
  contextNotes: string;
}

export interface ScoredStrategy {
  strategy: RecoveryStrategyType;
  recommendedChannel: RecoveryChannel;
  recoveryProbability: number;
  expectedValueINR: number;
  estimatedLatencyMinutes: number;
  customerFrictionScore: number; // 1 (low friction) to 5 (high friction)
  reasoning: string;
}

export interface StrategyOutput {
  chosenStrategy: RecoveryStrategyType;
  recommendedChannel: RecoveryChannel;
  recoveryProbability: number;
  expectedRecoveryINR: number;
  estimatedLatencyMinutes: number;
  primaryRationale: string;
  alternativeStrategies: ScoredStrategy[];
}

export interface GuardrailCheckResult {
  passed: boolean;
  status: "APPROVED" | "REJECTED" | "REQUIRES_HUMAN_OVERRIDE";
  ruleEvaluations: {
    ruleName: string;
    passed: boolean;
    reason: string;
  }[];
  finalReason: string;
}

export interface ExecutionResult {
  actionId: string;
  actionType: RecoveryStrategyType;
  channel: RecoveryChannel;
  status: "COMPLETED" | "FAILED" | "BLOCKED";
  simulatedGatewayResponseCode: string;
  executedPayload: Record<string, any>;
  executionTimestamp: string;
}

export interface OutcomeResult {
  isSuccessful: boolean;
  recoveredAmount: number;
  currency: string;
  latencyMs: number;
  baselineWouldWin: boolean;
  incrementalValue: number;
  outcomeSummary: string;
}

export interface AgentInvestigationFullResult {
  transactionId: string;
  amount: number;
  customerName: string;
  diagnosis: DiagnosisOutput;
  customerContext: CustomerContextOutput;
  strategy: StrategyOutput;
  guardrail: GuardrailCheckResult;
  execution?: ExecutionResult;
  outcome?: OutcomeResult;
  aiModelUsed: string;
  totalProcessingMs: number;
}
