import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const INDIAN_NAMES = [
  { name: "Aarav Sharma", email: "aarav.sharma@example.com", phone: "+919876543210", vpa: "aarav@okhdfcbank" },
  { name: "Priya Patel", email: "priya.patel@example.com", phone: "+919812345678", vpa: "priyap@paytm" },
  { name: "Rohit Verma", email: "rohit.verma@example.com", phone: "+919711223344", vpa: "rohitv@okaxis" },
  { name: "Ananya Iyer", email: "ananya.iyer@example.com", phone: "+919988776655", vpa: "ananya@ybl" },
  { name: "Rahul Deshmukh", email: "rahul.d@example.com", phone: "+919822334455", vpa: "rahul@icici" },
  { name: "Sneha Reddy", email: "sneha.reddy@example.com", phone: "+919944556677", vpa: "snehared@okhdfcbank" },
  { name: "Vikram Malhotra", email: "vikram.m@example.com", phone: "+919833445566", vpa: "vikram@okaxis" },
  { name: "Pooja Gupta", email: "pooja.g@example.com", phone: "+919755667788", vpa: "poojag@paytm" },
  { name: "Aditya Nair", email: "aditya.nair@example.com", phone: "+919866778899", vpa: "aditya@okhdfcbank" },
  { name: "Divya Kapoor", email: "divya.k@example.com", phone: "+919977889900", vpa: "divyak@icici" },
  { name: "Suresh Menon", email: "suresh.menon@example.com", phone: "+919888990011", vpa: "suresh@ybl" },
  { name: "Neha Joshi", email: "neha.joshi@example.com", phone: "+919899001122", vpa: "nehaj@okhdfcbank" },
  { name: "Amitav Mukherjee", email: "amitav.m@example.com", phone: "+919700112233", vpa: "amitav@okaxis" },
  { name: "Tanvi Singhania", email: "tanvi.s@example.com", phone: "+919911223344", vpa: "tanvis@paytm" },
  { name: "Karthik Sundaram", email: "karthik.s@example.com", phone: "+919822446688", vpa: "karthik@icici" },
  { name: "Ritu Agarwal", email: "ritu.a@example.com", phone: "+919733557799", vpa: "ritua@okhdfcbank" },
  { name: "Manish Choudhary", email: "manish.c@example.com", phone: "+919844668800", vpa: "manishc@ybl" },
  { name: "Meera Krishnan", email: "meera.k@example.com", phone: "+919955779911", vpa: "meerak@okaxis" },
  { name: "Siddharth Sen", email: "siddharth.s@example.com", phone: "+919866880022", vpa: "sid.sen@paytm" },
  { name: "Kavita Rao", email: "kavita.rao@example.com", phone: "+919777991133", vpa: "kavita@okhdfcbank" },
];

const ERROR_SCENARIOS = [
  {
    category: "TRANSIENT_NETWORK",
    code: "GATEWAY_TIMEOUT",
    desc: "Network connection lost during gateway token authorization",
    method: "UPI",
    prob: 0.82,
    strategy: "SMART_RETRY",
  },
  {
    category: "ISSUER_DOWNTIME",
    code: "ISSUER_DOWN",
    desc: "HDFC Core Banking UPI Switch currently experiencing high latency / down",
    method: "UPI",
    prob: 0.88,
    strategy: "DELAYED_RETRY",
  },
  {
    category: "INSUFFICIENT_FUNDS",
    code: "INSUFFICIENT_FUNDS",
    desc: "Customer account balance low; declined by issuing bank",
    method: "CARD",
    prob: 0.76,
    strategy: "PAYMENT_LINK",
  },
  {
    category: "AUTHENTICATION_TIMEOUT",
    code: "AUTHENTICATION_FAILED",
    desc: "UPI MPIN entered was incorrect or 2FA session expired",
    method: "UPI",
    prob: 0.85,
    strategy: "PAYMENT_LINK",
  },
  {
    category: "CARD_EXPIRED",
    code: "EXPIRED_CARD",
    desc: "Stored card token expired (validity date 05/26)",
    method: "CARD",
    prob: 0.86,
    strategy: "METHOD_RECOMMENDATION",
  },
  {
    category: "ISSUER_DOWNTIME",
    code: "BANK_SWITCH_OFFLINE",
    desc: "SBI NetBanking switch returned 504 Gateway Timeout",
    method: "NETBANKING",
    prob: 0.84,
    strategy: "DELAYED_RETRY",
  },
  {
    category: "FRAUD_FLAG",
    code: "BANK_DEEMED_HIGH_RISK",
    desc: "Velocity check triggered by issuer anti-fraud rule",
    method: "CARD",
    prob: 0.0,
    strategy: "NO_ACTION",
  },
];

export async function seedComprehensiveData(workspaceId: string, count: number = 2500) {
  console.log(`Seeding ${count} realistic synthetic transactions for workspace ${workspaceId}...`);

  // 1. Create or ensure customers
  const createdCustomers: any[] = [];
  for (const c of INDIAN_NAMES) {
    const existing = await db.customer.findFirst({
      where: { workspaceId, email: c.email },
    });

    if (existing) {
      createdCustomers.push(existing);
    } else {
      const riskProfile = c.name.includes("Malhotra") || c.name.includes("Singhania") ? "VIP" : "LOW";
      const customer = await db.customer.create({
        data: {
          workspaceId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          riskProfile,
          lifetimeValue: riskProfile === "VIP" ? 185000 : 24000,
          totalPayments: 12,
          successCount: 10,
          failureCount: 2,
          preferredMethod: "UPI",
          preferredVpa: c.vpa,
          paymentMethods: {
            create: [
              {
                type: "UPI",
                vpaHandle: c.vpa,
                isDefault: true,
                successRate: 0.92,
              },
              {
                type: "CARD",
                network: "VISA",
                last4: "4242",
                issuerBank: "HDFC",
                isDefault: false,
                successRate: 0.85,
              },
            ],
          },
        },
      });
      createdCustomers.push(customer);
    }
  }

  // 2. Generate transactions batch
  // 60% SUCCESS, 25% RECOVERED, 15% FAILED (active in recovery queue)
  const now = Date.now();
  const txnsToCreate: any[] = [];
  const recoveryCasesToCreate: any[] = [];
  const auditLogsToCreate: any[] = [];

  const amountsPool = [
    499, 999, 1499, 1999, 2499, 3999, 4999, 7999, 9999, 12500, 15000, 24999, 45000, 75000, 120000,
  ];

  for (let i = 0; i < count; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const rand = Math.random();
    const amount = amountsPool[Math.floor(Math.random() * amountsPool.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now - daysAgo * 86400000 - Math.random() * 86400000);

    const scenario = ERROR_SCENARIOS[Math.floor(Math.random() * ERROR_SCENARIOS.length)];

    let status = "SUCCESS";
    let recoveryStatus = "NONE";
    let errorCode: string | null = null;
    let errorDesc: string | null = null;
    let failureCat: string | null = null;
    let recoveredAt: Date | null = null;

    if (rand < 0.58) {
      // Direct Success
      status = "SUCCESS";
      recoveryStatus = "NONE";
    } else if (rand < 0.85) {
      // Recovered by AI
      status = "RECOVERED";
      recoveryStatus = "RECOVERED";
      errorCode = scenario.code;
      errorDesc = scenario.desc;
      failureCat = scenario.category;
      recoveredAt = new Date(createdAt.getTime() + (Math.floor(Math.random() * 45) + 5) * 60000);
    } else {
      // Failed / Active in Recovery Queue
      status = "FAILED";
      recoveryStatus = rand < 0.94 ? "QUEUED" : "IN_PROGRESS";
      errorCode = scenario.code;
      errorDesc = scenario.desc;
      failureCat = scenario.category;
    }

    const txnId = `txn_${Math.random().toString(36).substring(2, 12)}`;

    txnsToCreate.push({
      id: txnId,
      workspaceId,
      customerId: cust.id,
      externalId: `pay_${Math.random().toString(36).substring(2, 12)}`,
      orderId: `order_${Math.random().toString(36).substring(2, 12)}`,
      amount,
      currency: "INR",
      status,
      paymentMethod: scenario.method,
      vpa: scenario.method === "UPI" ? cust.preferredVpa : null,
      cardNetwork: scenario.method === "CARD" ? "VISA" : null,
      cardLast4: scenario.method === "CARD" ? "4242" : null,
      bankCode: scenario.method === "NETBANKING" ? "HDFC" : null,
      errorCode,
      errorDescription: errorDesc,
      failureCategory: failureCat,
      retryCount: status === "RECOVERED" ? 1 : status === "FAILED" ? 1 : 0,
      recoveryStatus,
      recoveredAt,
      createdAt,
      updatedAt: recoveredAt || createdAt,
    });
  }

  // Insert in chunks of 500
  const chunkSize = 500;
  for (let i = 0; i < txnsToCreate.length; i += chunkSize) {
    const chunk = txnsToCreate.slice(i, i + chunkSize);
    await db.transaction.createMany({
      data: chunk,
    });
  }

  // Fetch the created transactions that need recovery cases
  const failedAndRecoveredTxns = await db.transaction.findMany({
    where: {
      workspaceId,
      status: { in: ["FAILED", "RECOVERED"] },
    },
    take: 300,
    include: { customer: true },
  });

  for (const txn of failedAndRecoveredTxns) {
    const isRecovered = txn.status === "RECOVERED";
    const caseId = `rec_${Math.random().toString(36).substring(2, 10)}`;

    const rCase = await db.recoveryCase.create({
      data: {
        id: caseId,
        workspaceId,
        transactionId: txn.id,
        customerId: txn.customerId,
        status: isRecovered ? "RECOVERED" : "QUEUED",
        priority: txn.amount >= 50000 ? "CRITICAL" : txn.amount >= 10000 ? "HIGH" : "MEDIUM",
        riskScore: 0.25,
        recoveryProbability: 0.82,
        expectedRecovery: Number((txn.amount * 0.82).toFixed(2)),
        failureRootCause: txn.errorDescription || "Gateway timeout during checkout",
        assignedStrategy: txn.failureCategory === "INSUFFICIENT_FUNDS" ? "PAYMENT_LINK" : "SMART_RETRY",
        attemptCount: 1,
        resolvedAt: isRecovered ? txn.recoveredAt : null,
        createdAt: txn.createdAt,
      },
    });

    // Add AI Decision
    await db.aIDecision.create({
      data: {
        recoveryCaseId: rCase.id,
        agentType: "FULL_ORCHESTRATION_PIPELINE",
        modelUsed: "Deterministic-Expert-Engine-v2.6",
        diagnosedCause: txn.errorDescription || "Gateway timeout during checkout",
        customerProfile: `${txn.customer.riskProfile} | LTV ₹${txn.customer.lifetimeValue}`,
        confidence: 0.91,
        recommendedAction: rCase.assignedStrategy || "SMART_RETRY",
        reasoning: `Context-aware recovery selected based on ${txn.failureCategory || "transient error"} diagnosis. Recovery probability estimated at 82%.`,
        policyCheckPassed: true,
        policyCheckDetails: "Passed all 6 policy guardrails.",
        createdAt: txn.createdAt,
      },
    });

    if (isRecovered) {
      const action = await db.recoveryAction.create({
        data: {
          recoveryCaseId: rCase.id,
          actionType: rCase.assignedStrategy || "SMART_RETRY",
          channel: "API",
          status: "COMPLETED",
          guardrailStatus: "APPROVED",
          executedAt: txn.recoveredAt || txn.createdAt,
          createdAt: txn.createdAt,
        },
      });

      await db.recoveryOutcome.create({
        data: {
          recoveryCaseId: rCase.id,
          recoveryActionId: action.id,
          isSuccessful: true,
          recoveredAmount: txn.amount,
          currency: "INR",
          latencyMs: 340,
          baselineWouldWin: false,
          outcomeNotes: `Autonomous recovery succeeded. ₹${txn.amount.toLocaleString("en-IN")} settled.`,
          resolvedPaymentId: `pay_rec_${Math.random().toString(36).substring(2, 9)}`,
          createdAt: txn.recoveredAt || txn.createdAt,
        },
      });
    }

    // Add Audit Log
    auditLogsToCreate.push({
      workspaceId,
      transactionId: txn.id,
      actor: "SYSTEM_AI",
      action: isRecovered ? "OUTCOME_RECORDED" : "PAYMENT_FAILED",
      entityType: "TRANSACTION",
      entityId: txn.id,
      details: isRecovered
        ? `Payment ₹${txn.amount.toLocaleString("en-IN")} recovered successfully via ${rCase.assignedStrategy}.`
        : `Payment failed due to ${txn.errorCode || "GATEWAY_TIMEOUT"}. Revenue-at-risk detection triggered.`,
      payloadJson: JSON.stringify({ amount: txn.amount, category: txn.failureCategory }),
      createdAt: txn.createdAt,
    });
  }

  for (let i = 0; i < auditLogsToCreate.length; i += 200) {
    const chunk = auditLogsToCreate.slice(i, i + 200);
    await db.auditLog.createMany({
      data: chunk,
    });
  }

  console.log(`Successfully seeded ${count} transactions and recovery pipeline records.`);
}
