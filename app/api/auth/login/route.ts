import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateDemoWorkspace, signToken, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemoMode } = body;

    // Demo Mode login (Instant 1-Click access for Buildathon Evaluators)
    if (isDemoMode || (email === "demo@razorrecover.ai" && password === "demo123456")) {
      const { user, workspace } = await getOrCreateDemoWorkspace();
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
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check Database connection
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "DATABASE_URL environment variable is not configured in Vercel. Please click 'Launch Pre-Seeded Demo Mode' or attach a PostgreSQL database in Vercel Project Settings.",
        },
        { status: 503 }
      );
    }

    let user;
    try {
      user = await db.user.findUnique({
        where: { email },
        include: {
          memberships: {
            include: {
              workspace: true,
            },
          },
        },
      });
    } catch (dbErr: any) {
      console.error("Database query error:", dbErr);
      return NextResponse.json(
        {
          error:
            "Database is unreachable. Please verify your DATABASE_URL in Vercel, or click 'Launch Pre-Seeded Demo Mode' to explore immediately.",
        },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Use demo@razorrecover.ai / demo123456" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const workspace = user.memberships[0]?.workspace;
    if (!workspace) {
      return NextResponse.json(
        { error: "No associated workspace found" },
        { status: 403 }
      );
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
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error:
          "Unable to complete login. Please click 'Launch Pre-Seeded Demo Mode' or check DATABASE_URL in Vercel.",
      },
      { status: 500 }
    );
  }
}
