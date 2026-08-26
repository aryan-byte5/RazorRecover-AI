import { CustomerContextOutput, RecoveryChannel } from "./types";

interface CustomerInput {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  riskProfile: string;
  lifetimeValue: number;
  totalPayments: number;
  successCount: number;
  failureCount: number;
  preferredMethod?: string | null;
  preferredVpa?: string | null;
  lastContactedAt?: Date | null;
}

export async function runCustomerContextAgent(
  customer: CustomerInput
): Promise<CustomerContextOutput> {
  const total = customer.totalPayments || (customer.successCount + customer.failureCount) || 1;
  const successRate = total > 0 ? customer.successCount / total : 0.8;
  const ltv = customer.lifetimeValue || 0;

  // Determine risk profile
  let riskProfile: "LOW" | "MEDIUM" | "HIGH" | "VIP" = "LOW";
  if (ltv > 50000 || customer.riskProfile === "VIP") {
    riskProfile = "VIP";
  } else if (customer.riskProfile === "HIGH" || successRate < 0.4) {
    riskProfile = "HIGH";
  } else if (customer.riskProfile === "MEDIUM" || successRate < 0.7) {
    riskProfile = "MEDIUM";
  }

  // Determine preferred channel based on customer phone, email, and historical responsiveness
  let preferredChannel: RecoveryChannel = "WHATSAPP";
  if (!customer.phone) {
    preferredChannel = "EMAIL";
  } else if (riskProfile === "VIP") {
    preferredChannel = "WHATSAPP";
  } else if (customer.preferredMethod === "UPI") {
    preferredChannel = "IN_APP";
  }

  // Calculate contact fatigue risk
  let contactFatigueRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (customer.lastContactedAt) {
    const hoursSinceContact = (Date.now() - new Date(customer.lastContactedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceContact < 2) {
      contactFatigueRisk = "HIGH";
    } else if (hoursSinceContact < 8) {
      contactFatigueRisk = "MEDIUM";
    }
  }

  // Responsiveness score
  let responsivenessScore = 0.82;
  if (riskProfile === "VIP") responsivenessScore = 0.94;
  if (contactFatigueRisk === "HIGH") responsivenessScore = 0.35;
  if (successRate > 0.85) responsivenessScore = Math.min(0.98, responsivenessScore + 0.1);

  const notes = `${customer.name} (LTV: ₹${ltv.toLocaleString("en-IN")}, ${customer.successCount}/${total} past payments settled). Preferred rail: ${customer.preferredMethod || "UPI"} (${customer.preferredVpa || "default VPA"}). Contact fatigue status: ${contactFatigueRisk}.`;

  return {
    customerId: customer.id,
    riskProfile,
    historicalSuccessRate: Number(successRate.toFixed(2)),
    lifetimeValue: ltv,
    preferredChannel,
    preferredPaymentMethod: customer.preferredMethod || "UPI",
    preferredVpa: customer.preferredVpa || undefined,
    contactFatigueRisk,
    responsivenessScore: Number(responsivenessScore.toFixed(2)),
    contextNotes: notes,
  };
}
