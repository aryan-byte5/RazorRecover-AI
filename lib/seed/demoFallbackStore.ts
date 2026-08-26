/**
 * RazorRecover AI — Resilient In-Memory & Cloud Fallback Data Store
 * Provides rich synthetic demo telemetry for Buildathon evaluators
 * when PostgreSQL is connecting, cold-starting, or running in zero-config demo mode.
 */

export const DEMO_CUSTOMERS = [
  {
    id: "cust_demo_1",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    riskProfile: "VIP",
    lifetimeValue: 185000,
    preferredMethod: "UPI",
    preferredVpa: "aarav@okhdfcbank",
    _count: { transactions: 18, recoveryCases: 3 },
    transactions: [
      { id: "txn_demo_101", amount: 15000, status: "RECOVERED", paymentMethod: "UPI", createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "txn_demo_102", amount: 24500, status: "SUCCESS", paymentMethod: "UPI", createdAt: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
  {
    id: "cust_demo_2",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98123 45678",
    riskProfile: "LOW",
    lifetimeValue: 45000,
    preferredMethod: "UPI",
    preferredVpa: "priyap@paytm",
    _count: { transactions: 12, recoveryCases: 2 },
    transactions: [
      { id: "txn_demo_103", amount: 4999, status: "FAILED", paymentMethod: "UPI", createdAt: new Date(Date.now() - 7200000).toISOString() },
    ],
  },
  {
    id: "cust_demo_3",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91 98334 45566",
    riskProfile: "VIP",
    lifetimeValue: 240000,
    preferredMethod: "CARD",
    preferredVpa: "vikram@okaxis",
    _count: { transactions: 24, recoveryCases: 4 },
    transactions: [
      { id: "txn_demo_104", amount: 75000, status: "RECOVERED", paymentMethod: "CARD", createdAt: new Date(Date.now() - 14400000).toISOString() },
    ],
  },
  {
    id: "cust_demo_4",
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 99887 76655",
    riskProfile: "MEDIUM",
    lifetimeValue: 68000,
    preferredMethod: "UPI",
    preferredVpa: "ananya@ybl",
    _count: { transactions: 14, recoveryCases: 2 },
    transactions: [
      { id: "txn_demo_105", amount: 12500, status: "FAILED", paymentMethod: "UPI", createdAt: new Date(Date.now() - 21600000).toISOString() },
    ],
  },
  {
    id: "cust_demo_5",
    name: "Rohit Verma",
    email: "rohit.verma@example.com",
    phone: "+91 97112 23344",
    riskProfile: "LOW",
    lifetimeValue: 32000,
    preferredMethod: "NETBANKING",
    preferredVpa: "rohitv@okaxis",
    _count: { transactions: 8, recoveryCases: 1 },
    transactions: [
      { id: "txn_demo_106", amount: 7999, status: "RECOVERED", paymentMethod: "NETBANKING", createdAt: new Date(Date.now() - 28800000).toISOString() },
    ],
  },
];

export const DEMO_RECOVERY_CASES = [
  {
    id: "rec_demo_01",
    workspaceId: "ws_demo_aryan_koomar",
    transactionId: "txn_982341",
    status: "QUEUED",
    priority: "HIGH",
    riskScore: 0.28,
    recoveryProbability: 0.88,
    expectedRecovery: 10999.12,
    failureRootCause: "HDFC Core Banking UPI Switch latency timeout (> 15000ms)",
    assignedStrategy: "SMART_RETRY",
    attemptCount: 1,
    maxAttempts: 3,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    customer: {
      id: "cust_demo_1",
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+91 98765 43210",
      riskProfile: "VIP",
      lifetimeValue: 185000,
    },
    transaction: {
      id: "txn_982341",
      amount: 12499,
      currency: "INR",
      status: "FAILED",
      paymentMethod: "UPI",
      errorCode: "GATEWAY_TIMEOUT",
      errorDescription: "HDFC Core Banking UPI Switch latency timeout (> 15000ms)",
      failureCategory: "TRANSIENT_NETWORK",
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    aiDecisions: [
      {
        agentType: "DIAGNOSIS",
        diagnosedCause: "Transient gateway network drop on HDFC bank switch",
        confidence: 0.94,
        recommendedAction: "SMART_RETRY",
        reasoning: "Sub-second silent retry routed via optimized NPCI direct acquirer rail.",
        createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
      },
    ],
    actions: [
      {
        actionType: "SMART_RETRY",
        channel: "API",
        status: "PENDING",
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      },
    ],
    outcomes: [],
  },
  {
    id: "rec_demo_02",
    workspaceId: "ws_demo_aryan_koomar",
    transactionId: "txn_982342",
    status: "DIAGNOSED",
    priority: "CRITICAL",
    riskScore: 0.35,
    recoveryProbability: 0.82,
    expectedRecovery: 61500.0,
    failureRootCause: "Customer account balance low; declined by issuing bank (Insufficient Funds)",
    assignedStrategy: "PAYMENT_LINK",
    attemptCount: 1,
    maxAttempts: 3,
    createdAt: new Date(Date.now() - 32 * 60000).toISOString(),
    customer: {
      id: "cust_demo_3",
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      phone: "+91 98334 45566",
      riskProfile: "VIP",
      lifetimeValue: 240000,
    },
    transaction: {
      id: "txn_982342",
      amount: 75000,
      currency: "INR",
      status: "FAILED",
      paymentMethod: "CARD",
      errorCode: "INSUFFICIENT_FUNDS",
      errorDescription: "Declined by issuing bank due to low balance",
      failureCategory: "INSUFFICIENT_FUNDS",
      createdAt: new Date(Date.now() - 32 * 60000).toISOString(),
    },
    aiDecisions: [
      {
        agentType: "STRATEGY",
        diagnosedCause: "Insufficient funds on primary Visa card",
        confidence: 0.89,
        recommendedAction: "PAYMENT_LINK",
        reasoning: "Customer LTV ₹2.4L warrants 1-Click WhatsApp payment link to authorize alternative card.",
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
    ],
    actions: [
      {
        actionType: "PAYMENT_LINK",
        channel: "WHATSAPP",
        status: "EXECUTING",
        createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
      },
    ],
    outcomes: [],
  },
  {
    id: "rec_demo_03",
    workspaceId: "ws_demo_aryan_koomar",
    transactionId: "txn_982343",
    status: "RECOVERED",
    priority: "HIGH",
    riskScore: 0.15,
    recoveryProbability: 0.92,
    expectedRecovery: 24999.0,
    failureRootCause: "2FA Authentication session expired on mobile checkout",
    assignedStrategy: "PAYMENT_LINK",
    attemptCount: 1,
    maxAttempts: 3,
    resolvedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    customer: {
      id: "cust_demo_4",
      name: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      phone: "+91 99887 76655",
      riskProfile: "MEDIUM",
      lifetimeValue: 68000,
    },
    transaction: {
      id: "txn_982343",
      amount: 24999,
      currency: "INR",
      status: "RECOVERED",
      paymentMethod: "UPI",
      errorCode: "AUTHENTICATION_FAILED",
      errorDescription: "2FA Authentication session expired",
      failureCategory: "AUTHENTICATION_TIMEOUT",
      recoveredAt: new Date(Date.now() - 45 * 60000).toISOString(),
      createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    },
    aiDecisions: [
      {
        agentType: "STRATEGY",
        diagnosedCause: "Customer abandoned checkout during OTP wait",
        confidence: 0.95,
        recommendedAction: "PAYMENT_LINK",
        reasoning: "Instant WhatsApp link delivered; customer paid within 4.2 minutes.",
        createdAt: new Date(Date.now() - 88 * 60000).toISOString(),
      },
    ],
    actions: [
      {
        actionType: "PAYMENT_LINK",
        channel: "WHATSAPP",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 85 * 60000).toISOString(),
      },
    ],
    outcomes: [
      {
        isSuccessful: true,
        recoveredAmount: 24999,
        currency: "INR",
        timeToRecoverSecs: 252,
        incrementalLiftINR: 24999,
        customerFrictionScore: 1,
        verifiedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "rec_demo_04",
    workspaceId: "ws_demo_aryan_koomar",
    transactionId: "txn_982344",
    status: "QUEUED",
    priority: "MEDIUM",
    riskScore: 0.42,
    recoveryProbability: 0.78,
    expectedRecovery: 3899.22,
    failureRootCause: "SBI NetBanking server 504 Gateway Timeout during batch clearing",
    assignedStrategy: "DELAYED_RETRY",
    attemptCount: 0,
    maxAttempts: 3,
    createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
    customer: {
      id: "cust_demo_5",
      name: "Rohit Verma",
      email: "rohit.verma@example.com",
      phone: "+91 97112 23344",
      riskProfile: "LOW",
      lifetimeValue: 32000,
    },
    transaction: {
      id: "txn_982344",
      amount: 4999,
      currency: "INR",
      status: "FAILED",
      paymentMethod: "NETBANKING",
      errorCode: "BANK_SWITCH_OFFLINE",
      errorDescription: "SBI NetBanking 504 gateway timeout",
      failureCategory: "ISSUER_DOWNTIME",
      createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
    },
    aiDecisions: [],
    actions: [],
    outcomes: [],
  },
  {
    id: "rec_demo_05",
    workspaceId: "ws_demo_aryan_koomar",
    transactionId: "txn_982345",
    status: "RECOVERED",
    priority: "HIGH",
    riskScore: 0.18,
    recoveryProbability: 0.89,
    expectedRecovery: 15000.0,
    failureRootCause: "Primary card token expired (validity date 05/26)",
    assignedStrategy: "METHOD_RECOMMENDATION",
    attemptCount: 1,
    maxAttempts: 3,
    resolvedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    customer: {
      id: "cust_demo_2",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 98123 45678",
      riskProfile: "LOW",
      lifetimeValue: 45000,
    },
    transaction: {
      id: "txn_982345",
      amount: 15000,
      currency: "INR",
      status: "RECOVERED",
      paymentMethod: "CARD",
      errorCode: "EXPIRED_CARD",
      errorDescription: "Stored card token expired",
      failureCategory: "CARD_EXPIRED",
      recoveredAt: new Date(Date.now() - 120 * 60000).toISOString(),
      createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    },
    aiDecisions: [],
    actions: [],
    outcomes: [],
  },
];

export function getFallbackDashboardMetrics() {
  const trendDays = 14;
  const now = Date.now();
  const revenueTrend = [];

  for (let i = trendDays - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const atRisk = Math.floor(650000 + Math.sin(i) * 180000 + Math.random() * 120000);
    const recovered = Math.floor(atRisk * 0.742);
    const incremental = Math.floor(recovered * 0.46);

    revenueTrend.push({
      date: dateStr,
      atRisk,
      recovered,
      incremental,
    });
  }

  let cumulativeBaseline = 0;
  let cumulativeAi = 0;
  const aiVsBaseline = revenueTrend.map((point) => {
    cumulativeBaseline += point.recovered * 0.52;
    cumulativeAi += point.recovered;
    return {
      date: point.date,
      baseline: Math.round(cumulativeBaseline),
      aiRecovered: Math.round(cumulativeAi),
      incremental: Math.round(cumulativeAi - cumulativeBaseline),
    };
  });

  return {
    metrics: {
      revenueAtRisk: 14850000,
      revenueRecovered: 11025000,
      recoveryRate: 0.742,
      failedPaymentsCount: 382,
      recoverablePaymentsCount: 1450,
      activeRecoveriesCount: 78,
      avgRecoveryTimeMinutes: 8.4,
      incrementalRevenue: 5071500,
    },
    charts: {
      revenueTrend,
      recoveryFunnel: [
        { stage: "Payment Failures Detected", count: 2500, volume: 25875000 },
        { stage: "AI Multi-Agent Diagnosed", count: 2450, volume: 25357500 },
        { stage: "Interventions Dispatched", count: 2300, volume: 23805000 },
        { stage: "Settled / Recovered", count: 1855, volume: 19199250 },
      ],
      failureCategories: [
        { category: "TRANSIENT NETWORK", count: 850, volume: 8797500, percentage: 34.0 },
        { category: "ISSUER DOWNTIME", count: 625, volume: 6468750, percentage: 25.0 },
        { category: "INSUFFICIENT FUNDS", count: 475, volume: 4916250, percentage: 19.0 },
        { category: "AUTHENTICATION TIMEOUT", count: 350, volume: 3622500, percentage: 14.0 },
        { category: "CARD EXPIRED", count: 200, volume: 2070000, percentage: 8.0 },
      ],
      paymentMethods: [
        { method: "UPI", total: 1650, recovered: 1320, rate: 80.0 },
        { method: "CARD", total: 600, recovered: 420, rate: 70.0 },
        { method: "NETBANKING", total: 250, recovered: 175, rate: 70.0 },
      ],
      interventionPerformance: [
        { strategy: "Smart NPCI Retry", attempts: 412, recovered: 342, successRate: 83.0, avgRecoveryINR: 3420, avgLatency: "1.2s" },
        { strategy: "WhatsApp Dynamic Link", attempts: 298, recovered: 235, successRate: 78.8, avgRecoveryINR: 4890, avgLatency: "4.5m" },
        { strategy: "Payment Method Switch", attempts: 185, recovered: 139, successRate: 75.1, avgRecoveryINR: 6200, avgLatency: "2.1m" },
        { strategy: "Scheduled Delayed Retry", attempts: 144, recovered: 118, successRate: 81.9, avgRecoveryINR: 8450, avgLatency: "28m" },
        { strategy: "Personalized SMS Reminder", attempts: 92, recovered: 58, successRate: 63.0, avgRecoveryINR: 2150, avgLatency: "12m" },
        { strategy: "VIP Escalation Desk", attempts: 24, recovered: 21, successRate: 87.5, avgRecoveryINR: 85000, avgLatency: "1.8h" },
      ],
      aiVsBaseline,
    },
    recentFeed: [
      {
        id: "feed_1",
        action: "ACTION_EXECUTED",
        actor: "ACTION_EXECUTOR",
        description: "Dispatched WhatsApp 1-Click Recovery Payment Link for ₹75,000 to Vikram Malhotra (VIP)",
        createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      {
        id: "feed_2",
        action: "OUTCOME_VERIFIED",
        actor: "OUTCOME_EVALUATOR",
        description: "Payment of ₹24,999 settled successfully via UPI QR. Incremental lift verified.",
        createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
      },
      {
        id: "feed_3",
        action: "AI_DIAGNOSED",
        actor: "DIAGNOSIS_AGENT",
        description: "Detected HDFC Core Banking UPI Switch latency spike. Queued delayed retry job for 30m.",
        createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      },
    ],
  };
}
