import { ExecutionResult, OutcomeResult, StrategyOutput } from "./types";

interface OutcomeInput {
  amount: number;
  strategy: StrategyOutput;
  execution: ExecutionResult;
  failureCategory: string;
}

export function evaluateOutcome(input: OutcomeInput): OutcomeResult {
  const { amount, strategy, execution, failureCategory } = input;

  if (execution.status === "BLOCKED" || strategy.chosenStrategy === "NO_ACTION") {
    return {
      isSuccessful: false,
      recoveredAmount: 0,
      currency: "INR",
      latencyMs: 120,
      baselineWouldWin: false,
      incrementalValue: 0,
      outcomeSummary: "Action blocked by guardrails or classified as unrecoverable.",
    };
  }

  // Determine probabilistic success based on recovery probability
  // Use deterministic hash or pseudo-random check seeded by amount + category
  const probability = strategy.recoveryProbability;
  // For standard execution simulation, if probability > 0.45, high likelihood of success
  const isSuccessful = Math.random() < probability;

  // Baseline naive retry comparison:
  // Baseline (naive retry) only wins on transient network errors (35% rate) and fails completely on card expired / insufficient funds / downtime
  let baselineSuccess = false;
  if (failureCategory === "TRANSIENT_NETWORK" && Math.random() < 0.35) {
    baselineSuccess = true;
  }

  const recoveredAmount = isSuccessful ? amount : 0;
  const incrementalValue = isSuccessful && !baselineSuccess ? amount : 0;
  const latencyMs = Math.floor(250 + Math.random() * 300);

  let summary = "";
  if (isSuccessful) {
    summary = `Payment of ₹${amount.toLocaleString("en-IN")} successfully recovered via ${strategy.chosenStrategy} on channel ${execution.channel}. (AI incremental lift: ₹${incrementalValue.toLocaleString("en-IN")}).`;
  } else {
    summary = `Intervention ${strategy.chosenStrategy} completed, but customer did not settle transaction within the timeout window.`;
  }

  return {
    isSuccessful,
    recoveredAmount,
    currency: "INR",
    latencyMs,
    baselineWouldWin: baselineSuccess,
    incrementalValue,
    outcomeSummary: summary,
  };
}
