import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { seedComprehensiveData } from "@/lib/seed/seedDataGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, companyName, seedDemoData } = body;

    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: "Name, email, password, and company name are required" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(100 + Math.random() * 900);

    const workspace = await db.workspace.create({
      data: {
        name: companyName,
        slug,
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

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "ADMIN",
        memberships: {
          create: {
            workspaceId: workspace.id,
            role: "ADMIN",
          },
        },
      },
    });

    // Optionally seed initial batch of synthetic transactions
    if (seedDemoData !== false) {
      // Seed synchronously or in background
      seedComprehensiveData(workspace.id, 500).catch(console.error);
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
    });

    response.cookies.set("razor_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
