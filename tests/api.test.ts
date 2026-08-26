import test from "node:test";
import assert from "node:assert";
import { db } from "../lib/db";
import { signToken, verifyToken, hashPassword, verifyPassword, getOrCreateDemoWorkspace } from "../lib/auth";

test("Auth module signs and verifies valid JWT tokens", async () => {
  const userPayload = {
    id: "usr_test_123",
    email: "test@razorrecover.ai",
    name: "Test User",
    role: "ADMIN",
    workspaceId: "ws_test_123",
    workspaceName: "Test Org",
    workspaceSlug: "test-org",
  };

  const token = signToken(userPayload);
  assert.ok(token, "Token should be non-empty string");

  const verified = verifyToken(token);
  assert.ok(verified, "Token should verify successfully");
  assert.strictEqual(verified.email, userPayload.email);
  assert.strictEqual(verified.workspaceId, userPayload.workspaceId);
});

test("Password hashing and comparison behaves correctly", async () => {
  const pass = "FintechPassword2026";
  const hash = await hashPassword(pass);
  assert.ok(hash.startsWith("$2"), "Hash should be bcrypt format");

  const isValid = await verifyPassword(pass, hash);
  assert.strictEqual(isValid, true);

  const isInvalid = await verifyPassword("WrongPassword", hash);
  assert.strictEqual(isInvalid, false);
});

test("Demo workspace loader returns persistent workspace with settings", async () => {
  const { user, workspace } = await getOrCreateDemoWorkspace();
  assert.ok(user, "Demo user should exist");
  assert.ok(workspace, "Demo workspace should exist");
  assert.strictEqual(user.email, "demo@razorrecover.ai");

  const settings = await db.workspaceSettings.findUnique({
    where: { workspaceId: workspace.id },
  });
  assert.ok(settings, "Workspace settings should be initialized");
  assert.strictEqual(settings.maxRetries, 3);
});

test("Database contains seeded transactions across realistic failure categories", async () => {
  const totalTxns = await db.transaction.count();
  assert.ok(totalTxns >= 100, `Should have at least 100 transactions, found ${totalTxns}`);

  const recoveredCount = await db.transaction.count({
    where: { status: "RECOVERED" },
  });
  assert.ok(recoveredCount > 0, "Should have recovered transactions");

  const failedCount = await db.transaction.count({
    where: { status: "FAILED" },
  });
  assert.ok(failedCount > 0, "Should have failed transactions");
});
