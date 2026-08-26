import { ExecutionResult, RecoveryChannel, RecoveryStrategyType } from "./types";
import { getPaymentProvider } from "../payments/provider";

interface ExecutionInput {
  actionId: string;
  actionType: RecoveryStrategyType;
  channel: RecoveryChannel;
  transactionId: string;
  amount: number;
  customerEmail: string;
  customerPhone?: string | null;
  customerName: string;
}

export async function executeRecoveryAction(
  input: ExecutionInput
): Promise<ExecutionResult> {
  const { actionId, actionType, channel, transactionId, amount, customerName, customerEmail, customerPhone } = input;
  const paymentProvider = getPaymentProvider();

  const now = new Date().toISOString();
  let status: "COMPLETED" | "FAILED" | "BLOCKED" = "COMPLETED";
  let gatewayCode = "SUCCESS_200";
  const payload: Record<string, any> = {
    executedAt: now,
    transactionId,
    amount,
    currency: "INR",
    target: customerName,
    provider: paymentProvider.name,
    isSandboxEnvironment: paymentProvider.isSandbox,
  };

  switch (actionType) {
    case "SMART_RETRY":
      const retryResult = await paymentProvider.triggerSmartRetry({
        paymentId: transactionId,
        method: "UPI",
      });
      payload.mechanism = "NPCI_FAST_SWITCH_RETRY";
      payload.backoffDelayMs = retryResult.latencyMs;
      payload.retryRoute = "RAZORPAY_OPTIMIZED_DIRECT_ACQUIRER";
      gatewayCode = "RZP_PAYMENT_RECOVERY_SUCCESS";
      break;

    case "PAYMENT_LINK":
      const linkResult = await paymentProvider.createPaymentLink({
        amount,
        currency: "INR",
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        description: `RazorRecover 1-Click Recovery Payment (${transactionId})`,
      });
      payload.mechanism = "DYNAMIC_CHECKOUT_LINK_GEN";
      payload.paymentLinkId = linkResult.linkId;
      payload.shortUrl = linkResult.shortUrl;
      payload.channelDispatched = channel;
      payload.expiresAt = linkResult.expiresAt;
      gatewayCode = "LINK_DISPATCHED_201";
      break;

    case "METHOD_RECOMMENDATION":
      payload.mechanism = "IN_APP_METHOD_SWITCH_NUDGE";
      payload.recommendedRail = "UPI_FAST_PAY";
      payload.promptPresented = true;
      gatewayCode = "CLIENT_SWITCH_AUTHORIZED";
      break;

    case "PERSONALIZED_REMINDER":
      payload.mechanism = "WHATSAPP_RICH_TEMPLATE_DISPATCH";
      payload.templateName = "rzp_recovery_abandoned_cart_v3";
      payload.channel = "WHATSAPP_BUSINESS_API";
      gatewayCode = "WA_MESSAGE_DELIVERED";
      break;

    case "DELAYED_RETRY":
      payload.mechanism = "EXPONENTIAL_BACKOFF_SCHEDULER";
      payload.scheduledFor = new Date(Date.now() + 15 * 60000).toISOString();
      payload.backoffStrategy = "ISSUER_HEALTH_RESTORATION_SYNC";
      gatewayCode = "RETRY_JOB_QUEUED";
      break;

    case "ESCALATION":
      payload.mechanism = "VIP_CUSTOMER_DESK_ROUTING";
      payload.escalationTier = "TIER_3_FINTECH_OPS";
      payload.ticketId = `TICK_${Math.floor(100000 + Math.random() * 900000)}`;
      gatewayCode = "ESCALATED_FOR_MANUAL_REVIEW";
      break;

    case "NO_ACTION":
    default:
      payload.mechanism = "SUPPRESSION_GUARD_ACTIVE";
      payload.reason = "Unrecoverable payment error / excessive retry fatigue";
      status = "BLOCKED";
      gatewayCode = "NO_ACTION_DISPATCHED";
      break;
  }

  return {
    actionId,
    actionType,
    channel,
    status,
    simulatedGatewayResponseCode: gatewayCode,
    executedPayload: payload,
    executionTimestamp: now,
  };
}
