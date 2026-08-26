import test from "node:test";
import assert from "node:assert";
import { db } from "../lib/db";
import { runRecoveryOrchestrator } from "../lib/agents/orchestrator";
import { runRecoverySimulation } from "../lib/simulation/simulationEngine";

test("Database Persistence Test 1: Customer CRUD & Relationship Persistence", async () => {
  const workspace = await db.workspace.findFirst();
  assert.ok(workspace, "Workspace must exist in database");

  // Create new customer
  const customerEmail = `test.persistence.${Date.now()}@example.com`;
  const created = await db.customer.create({
    data: {
      workspaceId: workspace.id,
      name: "Rohit Kulkarni",
      email: customerEmail,
      phone: "+919876500112",
      riskProfile: "VIP",
      lifetimeValue: 125000,
      totalPayments: 10,
      successCount: 9,
      failureCount: 1,
      preferredMethod: "UPI",
      preferredVpa: "rohit@okhdfcbank",
    },
  });

  assert.ok(created.id, "Customer record should have primary key ID");
  assert.strictEqual(created.email, customerEmail);

  // Retrieve customer directly from database
  const fetched = await db.customer.findUnique({
    where: { id: created.id },
  });
  assert.ok(fetched, "Customer should be fetched from database");
  assert.strictEqual(fetched.name, "Rohit Kulkarni");
  assert.strictEqual(fetched.riskProfile, "VIP");

  // Update customer
  const updated = await db.customer.update({
    where: { id: created.id },
    data: { lifetimeValue: 150000 },
  });
  assert.strictEqual(updated.lifetimeValue, 150000);
});

test("Database Persistence Test 2: Transaction Creation & Customer Association", async () => {
  const workspace = await db.workspace.findFirst();
  const customer = await db.customer.findFirst({ where: { workspaceId: workspace!.id } });
  assert.ok(customer, "Customer must exist");

  const txn = await db.transaction.create({
    data: {
      workspaceId: workspace!.id,
      customerId: customer.id,
      externalId: `pay_test_${Date.now()}`,
      orderId: `order_test_${Date.now()}`,
      amount: 9999,
      currency: "INR",
      status: "FAILED",
      paymentMethod: "UPI",
      vpa: customer.preferredVpa || "user@okhdfcbank",
      errorCode: "GATEWAY_TIMEOUT",
      errorDescription: "HDFC Core Banking switch latency > 8000ms",
      recoveryStatus: "QUEUED",
    },
  });

  assert.ok(txn.id, "Transaction should be created with ID");
  assert.strictEqual(txn.amount, 9999);
  assert.strictEqual(txn.status, "FAILED");

  // Verify relation
  const loadedTxn = await db.transaction.findUnique({
    where: { id: txn.id },
    include: { customer: true },
  });
  assert.strictEqual(loadedTxn?.customer.id, customer.id);
});

test("Database Persistence Test 3: Atomic Recovery Execution & Multi-Table Integrity", async () => {
  const workspace = await db.workspace.findFirst();
  const customer = await db.customer.findFirst({ where: { workspaceId: workspace!.id } });

  const failedTxn = await db.transaction.create({
    data: {
      workspaceId: workspace!.id,
      customerId: customer!.id,
      externalId: `pay_rec_${Date.now()}`,
      amount: 14999,
      currency: "INR",
      status: "FAILED",
      paymentMethod: "UPI",
      errorCode: "GATEWAY_TIMEOUT",
      errorDescription: "HDFC bank timeout",
      recoveryStatus: "QUEUED",
    },
  });

  // Execute full autonomous recovery pipeline
  const result = await runRecoveryOrchestrator({
    transactionId: failedTxn.id,
    autoExecute: true,
  });

  assert.ok(result.diagnosis, "Diagnosis output should exist");
  assert.ok(result.strategy, "Strategy output should exist");
  assert.ok(result.guardrail, "Guardrail evaluation should exist");

  // Verify multi-table records in PostgreSQL/SQLite
  const recoveryCase = await db.recoveryCase.findFirst({
    where: { transactionId: failedTxn.id },
    include: {
      actions: true,
      outcomes: true,
      aiDecisions: true,
    },
  });

  assert.ok(recoveryCase, "RecoveryCase record must be persisted");
  assert.ok(recoveryCase.aiDecisions.length >= 1, "AIDecisions should be persisted in database");
  assert.ok(recoveryCase.actions.length >= 1, "RecoveryAction should be persisted");
  assert.ok(recoveryCase.outcomes.length >= 1, "RecoveryOutcome should be persisted");

  // Verify transaction status updated to RECOVERED
  const updatedTxn = await db.transaction.findUnique({
    where: { id: failedTxn.id },
  });
  assert.strictEqual(updatedTxn?.recoveryStatus, "RECOVERED");

  // Verify AuditLog was stored
  const audit = await db.auditLog.findFirst({
    where: { transactionId: failedTxn.id },
  });
  assert.ok(audit, "AuditLog must be persisted in database");
});

test("Database Persistence Test 4: WorkspaceSettings Persistence", async () => {
  const workspace = await db.workspace.findFirst();
  assert.ok(workspace);

  const updatedSettings = await db.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    create: {
      workspaceId: workspace.id,
      maxRetries: 4,
      quietHoursStart: 23,
      quietHoursEnd: 7,
      humanReviewThreshold: 75000,
      aiProvider: "DETERMINISTIC_EXPERT",
    },
    update: {
      maxRetries: 4,
      quietHoursStart: 23,
      quietHoursEnd: 7,
      humanReviewThreshold: 75000,
    },
  });

  assert.strictEqual(updatedSettings.maxRetries, 4);
  assert.strictEqual(updatedSettings.quietHoursStart, 23);
  assert.strictEqual(updatedSettings.humanReviewThreshold, 75000);

  // Re-fetch from DB
  const reloaded = await db.workspaceSettings.findUnique({
    where: { workspaceId: workspace.id },
  });
  assert.strictEqual(reloaded?.maxRetries, 4);

  // Restore defaults
  await db.workspaceSettings.update({
    where: { workspaceId: workspace.id },
    data: { maxRetries: 3 },
  });
});
