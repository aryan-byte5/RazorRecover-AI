-- ============================================================================
-- RazorRecover AI — Complete Production MySQL DDL Schema
-- Compatible with MySQL 8.0+, MariaDB 10.5+, AWS RDS MySQL, PlanetScale, Aiven
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `razorrecover` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `razorrecover`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `avatarUrl` VARCHAR(512) NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Workspaces Table
CREATE TABLE IF NOT EXISTS `workspaces` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `workspaces_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Memberships Table
CREATE TABLE IF NOT EXISTS `memberships` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `workspaceId` VARCHAR(191) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `memberships_userId_workspaceId_key` (`userId`, `workspaceId`),
  CONSTRAINT `fk_memberships_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_memberships_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(191) NOT NULL,
  `workspaceId` VARCHAR(191) NOT NULL,
  `externalId` VARCHAR(191) NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `riskProfile` VARCHAR(50) NOT NULL DEFAULT 'LOW',
  `lifetimeValue` DOUBLE NOT NULL DEFAULT 0,
  `totalPayments` INT NOT NULL DEFAULT 0,
  `successCount` INT NOT NULL DEFAULT 0,
  `failureCount` INT NOT NULL DEFAULT 0,
  `preferredMethod` VARCHAR(50) NULL,
  `preferredVpa` VARCHAR(191) NULL,
  `contactConsent` BOOLEAN NOT NULL DEFAULT TRUE,
  `lastContactedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `customers_workspaceId_email_idx` (`workspaceId`, `email`),
  CONSTRAINT `fk_customers_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Payment Methods Table
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` VARCHAR(191) NOT NULL,
  `customerId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `network` VARCHAR(50) NULL,
  `last4` VARCHAR(10) NULL,
  `issuerBank` VARCHAR(50) NULL,
  `vpaHandle` VARCHAR(191) NULL,
  `isDefault` BOOLEAN NOT NULL DEFAULT FALSE,
  `successRate` DOUBLE NOT NULL DEFAULT 0.85,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payment_methods_customer` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Transactions Table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(191) NOT NULL,
  `workspaceId` VARCHAR(191) NOT NULL,
  `customerId` VARCHAR(191) NOT NULL,
  `externalId` VARCHAR(191) NULL,
  `orderId` VARCHAR(191) NULL,
  `amount` DOUBLE NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `status` VARCHAR(50) NOT NULL,
  `paymentMethod` VARCHAR(50) NOT NULL,
  `vpa` VARCHAR(191) NULL,
  `cardNetwork` VARCHAR(50) NULL,
  `cardLast4` VARCHAR(10) NULL,
  `bankCode` VARCHAR(50) NULL,
  `errorCode` VARCHAR(100) NULL,
  `errorDescription` TEXT NULL,
  `failureCategory` VARCHAR(100) NULL,
  `retryCount` INT NOT NULL DEFAULT 0,
  `recoveryStatus` VARCHAR(50) NOT NULL DEFAULT 'NONE',
  `recoveredAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `transactions_workspaceId_status_idx` (`workspaceId`, `status`),
  KEY `transactions_workspaceId_recoveryStatus_idx` (`workspaceId`, `recoveryStatus`),
  CONSTRAINT `fk_transactions_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transactions_customer` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Recovery Cases Table
CREATE TABLE IF NOT EXISTS `recovery_cases` (
  `id` VARCHAR(191) NOT NULL,
  `workspaceId` VARCHAR(191) NOT NULL,
  `transactionId` VARCHAR(191) NOT NULL,
  `customerId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
  `priority` VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  `riskScore` DOUBLE NOT NULL DEFAULT 0.2,
  `recoveryProbability` DOUBLE NOT NULL DEFAULT 0.5,
  `expectedRecovery` DOUBLE NOT NULL DEFAULT 0.0,
  `failureRootCause` TEXT NULL,
  `assignedStrategy` VARCHAR(100) NULL,
  `maxAttempts` INT NOT NULL DEFAULT 3,
  `attemptCount` INT NOT NULL DEFAULT 0,
  `lastAttemptAt` DATETIME(3) NULL,
  `resolvedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `recovery_cases_workspaceId_status_idx` (`workspaceId`, `status`),
  CONSTRAINT `fk_recovery_cases_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recovery_cases_transaction` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recovery_cases_customer` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. AI Decisions Table
CREATE TABLE IF NOT EXISTS `ai_decisions` (
  `id` VARCHAR(191) NOT NULL,
  `recoveryCaseId` VARCHAR(191) NOT NULL,
  `agentType` VARCHAR(100) NOT NULL,
  `modelUsed` VARCHAR(100) NOT NULL DEFAULT 'Deterministic-Expert-Engine-v2.6',
  `diagnosedCause` TEXT NOT NULL,
  `customerProfile` VARCHAR(255) NULL,
  `confidence` DOUBLE NOT NULL DEFAULT 0.8,
  `recommendedAction` VARCHAR(100) NOT NULL,
  `reasoning` TEXT NOT NULL,
  `policyCheckPassed` BOOLEAN NOT NULL DEFAULT TRUE,
  `policyCheckDetails` TEXT NULL,
  `metadataJson` LONGTEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ai_decisions_recovery_case` FOREIGN KEY (`recoveryCaseId`) REFERENCES `recovery_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Recovery Actions Table
CREATE TABLE IF NOT EXISTS `recovery_actions` (
  `id` VARCHAR(191) NOT NULL,
  `recoveryCaseId` VARCHAR(191) NOT NULL,
  `actionType` VARCHAR(100) NOT NULL,
  `channel` VARCHAR(50) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `payloadDetails` TEXT NULL,
  `guardrailStatus` VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
  `guardrailReason` TEXT NULL,
  `executedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_recovery_actions_recovery_case` FOREIGN KEY (`recoveryCaseId`) REFERENCES `recovery_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Recovery Outcomes Table
CREATE TABLE IF NOT EXISTS `recovery_outcomes` (
  `id` VARCHAR(191) NOT NULL,
  `recoveryCaseId` VARCHAR(191) NOT NULL,
  `recoveryActionId` VARCHAR(191) NULL,
  `isSuccessful` BOOLEAN NOT NULL DEFAULT FALSE,
  `recoveredAmount` DOUBLE NOT NULL DEFAULT 0.0,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
  `latencyMs` INT NOT NULL DEFAULT 350,
  `baselineWouldWin` BOOLEAN NOT NULL DEFAULT FALSE,
  `outcomeNotes` TEXT NULL,
  `resolvedPaymentId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_recovery_outcomes_case` FOREIGN KEY (`recoveryCaseId`) REFERENCES `recovery_cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recovery_outcomes_action` FOREIGN KEY (`recoveryActionId`) REFERENCES `recovery_actions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Experiments Table
CREATE TABLE IF NOT EXISTS `experiments` (
  `id` VARCHAR(191) NOT NULL,
  `workspaceId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `sampleSize` INT NOT NULL DEFAULT 500,
  `status` VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
  `baselineStrategy` VARCHAR(100) NOT NULL DEFAULT 'NAIVE_IMMEDIATE_RETRY',
  `aiStrategy` VARCHAR(100) NOT NULL DEFAULT 'AUTONOMOUS_MULTI_AGENT_RECOVERY',
  `totalVolumeAtRisk` DOUBLE NOT NULL DEFAULT 0.0,
  `baselineRecovered` DOUBLE NOT NULL DEFAULT 0.0,
  `aiRecovered` DOUBLE NOT NULL DEFAULT 0.0,
  `incrementalLift` DOUBLE NOT NULL DEFAULT 0.0,
  `baselineRecoveryRate` DOUBLE NOT NULL DEFAULT 0.0,
  `aiRecoveryRate` DOUBLE NOT NULL DEFAULT 0.0,
  `avgRecoveryTimeSecs` DOUBLE NOT NULL DEFAULT 0.0,
  `customerFrictionDrop` DOUBLE NOT NULL DEFAULT 0.0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_experiments_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Experiment Results Table
CREATE TABLE IF NOT EXISTS `experiment_results` (
  `id` VARCHAR(191) NOT NULL,
  `experimentId` VARCHAR(191) NOT NULL,
  `transactionId` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `failureCategory` VARCHAR(100) NOT NULL,
  `baselineAction` VARCHAR(100) NOT NULL,
  `baselineRecovered` BOOLEAN NOT NULL DEFAULT FALSE,
  `aiAction` VARCHAR(100) NOT NULL,
  `aiRecovered` BOOLEAN NOT NULL DEFAULT FALSE,
  `incrementalWin` BOOLEAN NOT NULL DEFAULT FALSE,
  `aiReasoning` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_experiment_results_experiment` FOREIGN KEY (`experimentId`) REFERENCES `experiments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(191) NOT NULL,
  `workspaceId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `transactionId` VARCHAR(191) NULL,
  `actor` VARCHAR(100) NOT NULL DEFAULT 'SYSTEM_AI',
  `action` VARCHAR(100) NOT NULL,
  `entityType` VARCHAR(100) NOT NULL,
  `entityId` VARCHAR(191) NULL,
  `details` TEXT NOT NULL,
  `payloadJson` LONGTEXT NULL,
  `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_workspaceId_timestamp_idx` (`workspaceId`, `timestamp`),
  CONSTRAINT `fk_audit_logs_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_audit_logs_transaction` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Workspace Settings Table
CREATE TABLE IF NOT EXISTS `workspace_settings` (
  `id` VARCHAR(191) NOT NULL,
  `workspaceId` VARCHAR(191) NOT NULL,
  `maxRetries` INT NOT NULL DEFAULT 3,
  `quietHoursStart` INT NOT NULL DEFAULT 22,
  `quietHoursEnd` INT NOT NULL DEFAULT 8,
  `minRecoveryProbFloor` DOUBLE NOT NULL DEFAULT 0.35,
  `humanReviewThreshold` DOUBLE NOT NULL DEFAULT 50000,
  `aiProvider` VARCHAR(100) NOT NULL DEFAULT 'DETERMINISTIC_EXPERT',
  `aiApiKey` VARCHAR(512) NULL,
  `razorpayKeyId` VARCHAR(191) NULL,
  `razorpayKeySecret` VARCHAR(191) NULL,
  `webhookSecret` VARCHAR(191) NULL,
  `enableAutoRecovery` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workspace_settings_workspaceId_key` (`workspaceId`),
  CONSTRAINT `fk_workspace_settings_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
