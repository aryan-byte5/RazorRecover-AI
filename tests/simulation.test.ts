import test from "node:test";
import assert from "node:assert";
import { runRecoverySimulation } from "../lib/simulation/simulationEngine";
import { db } from "../lib/db";

test("Recovery Simulation Engine executes batch, computes lift and persists experiment", async () => {
  const workspace = await db.workspace.findFirst();
  assert.ok(workspace, "Workspace should exist in database");

  const simulation = await runRecoverySimulation(workspace.id, 50);

  assert.strictEqual(simulation.sampleSize, 50);
  assert.ok(simulation.totalVolumeAtRisk > 0);
  assert.ok(simulation.aiRecovered >= 0);
  assert.ok(simulation.incrementalLift >= 0);
  assert.ok(simulation.results.length === 50);

  // Check experiment was saved in DB
  const exp = await db.experiment.findUnique({
    where: { id: simulation.experimentId },
  });
  assert.ok(exp, "Experiment record should exist in DB");
  assert.strictEqual(exp.sampleSize, 50);
});
