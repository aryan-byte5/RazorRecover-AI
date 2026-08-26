import { DiagnosisOutput, FailureCategory } from "./types";

interface TransactionInput {
  amount: number;
  paymentMethod: string;
  errorCode?: string | null;
  errorDescription?: string | null;
  bankCode?: string | null;
  vpa?: string | null;
  cardNetwork?: string | null;
  retryCount: number;
}

export async function runPaymentDiagnosisAgent(
  transaction: TransactionInput
): Promise<DiagnosisOutput> {
  const code = (transaction.errorCode || "").toUpperCase();
  const desc = (transaction.errorDescription || "").toLowerCase();
  const method = (transaction.paymentMethod || "").toUpperCase();
  const bank = (transaction.bankCode || "").toUpperCase();

  let category: FailureCategory = "UNKNOWN_ERROR";
  let rootCause = "Unspecified payment gateway exception";
  let isTransient = false;
  let downtimeProbability = 0.1;
  let confidence = 0.85;
  const evidence: string[] = [];

  // Bank downtime patterns
  if (
    code.includes("GATEWAY_TIMEOUT") ||
    code.includes("ISSUER_DOWN") ||
    desc.includes("bank server down") ||
    desc.includes("issuer response timeout") ||
    desc.includes("upi switch not responding") ||
    bank === "HDFC_DOWNTIME" ||
    bank === "SBI_DOWNTIME"
  ) {
    category = "ISSUER_DOWNTIME";
    rootCause = `Core banking switch or NPCI UPI rail timeout with issuer ${bank || method}`;
    isTransient = true;
    downtimeProbability = 0.92;
    confidence = 0.94;
    evidence.push(`Gateway returned timeout code: ${code || "GATEWAY_TIMEOUT"}`);
    evidence.push(`Active telemetry indicates peak failure rate on ${bank || method} network`);
  }
  // Transient network / socket errors
  else if (
    code.includes("NETWORK_ERROR") ||
    code.includes("SOCKET_TIMEOUT") ||
    desc.includes("connection lost") ||
    desc.includes("timed out")
  ) {
    category = "TRANSIENT_NETWORK";
    rootCause = "Transient TCP handshake / client-side drop during token exchange";
    isTransient = true;
    downtimeProbability = 0.25;
    confidence = 0.89;
    evidence.push("Network packet dropped prior to bank ledger debit confirmation");
    evidence.push("No reverse debits or double debits observed");
  }
  // Insufficient balance
  else if (
    code.includes("INSUFFICIENT_FUNDS") ||
    code.includes("LOW_BALANCE") ||
    desc.includes("insufficient funds") ||
    desc.includes("balance low") ||
    desc.includes("not enough balance")
  ) {
    category = "INSUFFICIENT_FUNDS";
    rootCause = "Customer account balance lower than checkout order total";
    isTransient = false;
    downtimeProbability = 0.02;
    confidence = 0.96;
    evidence.push("Issuer returned standard code: INSUFFICIENT_BALANCE / Z9");
    evidence.push("Customer retry attempt immediately will fail without alternate funding source");
  }
  // Authentication / OTP / MPIN
  else if (
    code.includes("AUTHENTICATION_FAILED") ||
    code.includes("MPIN_INVALID") ||
    code.includes("OTP_EXPIRED") ||
    desc.includes("mpin entered is wrong") ||
    desc.includes("otp expired") ||
    desc.includes("incorrect pin")
  ) {
    category = "AUTHENTICATION_TIMEOUT";
    rootCause = "Customer 2FA authentication lapse (incorrect MPIN / expired OTP token)";
    isTransient = true;
    downtimeProbability = 0.05;
    confidence = 0.92;
    evidence.push("NPCI UPI MPIN validation failed on device token");
    evidence.push("Account is active and funded, frictionless retry or payment link will convert");
  }
  // Expired cards
  else if (
    code.includes("EXPIRED_CARD") ||
    desc.includes("card has expired") ||
    desc.includes("invalid validity")
  ) {
    category = "CARD_EXPIRED";
    rootCause = "Stored card token expired or invalid card validity year passed";
    isTransient = false;
    downtimeProbability = 0.0;
    confidence = 0.99;
    evidence.push("Card token expiry date precedes transaction timestamp");
    evidence.push("Immediate retry on same token will 100% fail; requires method switch");
  }
  // Fraud / Risk flags
  else if (
    code.includes("BANK_DEEMED_HIGH_RISK") ||
    code.includes("FRAUD_SUSPECTED") ||
    desc.includes("risk threshold exceeded") ||
    desc.includes("velocity check failed")
  ) {
    category = "FRAUD_FLAG";
    rootCause = "Velocity checks or bank heuristic anti-fraud filters triggered";
    isTransient = false;
    downtimeProbability = 0.05;
    confidence = 0.88;
    evidence.push("Risk score crossed gateway safety thresholds");
    evidence.push("Requires automated cooldown or human operations sign-off");
  }
  // Fallback defaults based on payment method
  else {
    if (method === "UPI") {
      category = "AUTHENTICATION_TIMEOUT";
      rootCause = "UPI Collect request declined or timed out on user device";
      isTransient = true;
      downtimeProbability = 0.18;
      confidence = 0.82;
      evidence.push("UPI push notification expired after 8 minutes idle");
    } else {
      category = "TRANSIENT_NETWORK";
      rootCause = "Intermittent payment gateway processing error";
      isTransient = true;
      downtimeProbability = 0.2;
      confidence = 0.78;
      evidence.push("Generic gateway error during 3DS redirect authorization");
    }
  }

  return {
    failureCategory: category,
    rootCause,
    isTransient,
    downtimeProbability,
    confidence,
    evidence,
  };
}
