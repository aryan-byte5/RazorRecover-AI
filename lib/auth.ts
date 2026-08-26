import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { seedComprehensiveData } from "./seed/seedDataGenerator";

const JWT_SECRET = process.env.JWT_SECRET || "razor-recover-ai-super-secret-jwt-key-2026";
const COOKIE_NAME = "razor_auth_token";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function getOrCreateDemoWorkspace(): Promise<{
  user: any;
  workspace: any;
}> {
  try {
    // 1. Check if demo user already exists in database
    let demoUser = await db.user.findUnique({
      where: { email: "demo@razorrecover.ai" },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    let workspace: any;

    if (!demoUser) {
      const passwordHash = await hashPassword("demo123456");
      workspace = await db.workspace.create({
        data: {
          name: "Acme Payments India",
          slug: "acme-payments",
          currency: "INR",
          settings: {
            create: {
              maxRetries: 3,
              cooldownHours: 2,
              minRecoveryProbability: 0.35,
              enableWhatsAppReminders: true,
              enableSmsReminders: true,
              enableSmartSwitch: true,
              enableAutoLinks: true,
              quietHoursStart: 22,
              quietHoursEnd: 8,
              humanReviewThreshold: 50000.0,
              aiProvider: "DETERMINISTIC_EXPERT",
            },
          },
        },
      });

      demoUser = await db.user.create({
        data: {
          email: "demo@razorrecover.ai",
          name: "Aryan Koomar",
          passwordHash,
          role: "ADMIN",
          memberships: {
            create: {
              workspaceId: workspace.id,
              role: "ADMIN",
            },
          },
        },
        include: {
          memberships: {
            include: {
              workspace: true,
            },
          },
        },
      });
    } else {
      if (demoUser.name !== "Aryan Koomar") {
        demoUser = await db.user.update({
          where: { id: demoUser.id },
          data: { name: "Aryan Koomar" },
          include: {
            memberships: {
              include: {
                workspace: true,
              },
            },
          },
        });
      }
      workspace = demoUser.memberships[0]?.workspace;
    }

    if (!workspace) {
      workspace = await db.workspace.findFirst() || {
        id: "ws_demo_aryan_koomar",
        name: "Acme Payments India",
        slug: "acme-payments",
        currency: "INR",
      };
    }

    // 2. Auto-seed 2,500 demo records if database is empty
    const txnCount = await db.transaction.count({
      where: { workspaceId: workspace.id },
    }).catch(() => 0);

    if (txnCount < 50) {
      console.log(`Auto-seeding initial transactions for workspace ${workspace.id}...`);
      await seedComprehensiveData(workspace.id, 1500).catch((e) => {
        console.error("Auto-seeding error in getOrCreateDemoWorkspace:", e);
      });
    }

    return { user: demoUser, workspace };
  } catch (err) {
    console.warn("Database fallback for demo workspace:", err);
    return {
      user: {
        id: "usr_demo_aryan_koomar",
        email: "demo@razorrecover.ai",
        name: "Aryan Koomar",
        role: "ADMIN",
      },
      workspace: {
        id: "ws_demo_aryan_koomar",
        name: "Aryan Koomar Recovery Operations",
        slug: "aryan-koomar-recovery",
        currency: "INR",
      },
    };
  }
}
