import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_CUSTOMERS } from "@/lib/seed/demoFallbackStore";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CreateCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  riskProfile: z.enum(["LOW", "MEDIUM", "HIGH", "VIP"]).default("LOW"),
  preferredMethod: z.enum(["UPI", "CARD", "NETBANKING"]).default("UPI"),
  preferredVpa: z.string().optional(),
  lifetimeValue: z.number().nonnegative().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let workspaceId = user?.workspaceId;

    if (!workspaceId) {
      const firstWs = await db.workspace.findFirst().catch(() => null);
      if (!firstWs) return NextResponse.json({ customers: DEMO_CUSTOMERS, total: DEMO_CUSTOMERS.length, page: 1, totalPages: 1 });
      workspaceId = firstWs.id;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const risk = searchParams.get("risk");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };

    if (risk && risk !== "ALL") {
      where.riskProfile = risk;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { preferredVpa: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          transactions: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              transactions: true,
              recoveryCases: true,
            },
          },
        },
        orderBy: { lifetimeValue: "desc" },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    if (total === 0) {
      return NextResponse.json({
        customers: DEMO_CUSTOMERS,
        total: DEMO_CUSTOMERS.length,
        page: 1,
        totalPages: 1,
      });
    }

    return NextResponse.json({
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.warn("Customers API fallback active:", error?.message);
    return NextResponse.json({
      customers: DEMO_CUSTOMERS,
      total: DEMO_CUSTOMERS.length,
      page: 1,
      totalPages: 1,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let workspaceId = user?.workspaceId;

    if (!workspaceId) {
      const firstWs = await db.workspace.findFirst().catch(() => null);
      if (!firstWs) return NextResponse.json({ error: "No workspace found" }, { status: 404 });
      workspaceId = firstWs.id;
    }

    const json = await req.json();
    const validated = CreateCustomerSchema.parse(json);

    const existing = await db.customer.findFirst({
      where: { workspaceId, email: validated.email },
    }).catch(() => null);

    if (existing) {
      return NextResponse.json(
        { error: "A customer with this email address already exists in this workspace" },
        { status: 409 }
      );
    }

    const customer = await db.customer.create({
      data: {
        workspaceId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        riskProfile: validated.riskProfile,
        preferredMethod: validated.preferredMethod,
        preferredVpa: validated.preferredVpa,
        lifetimeValue: validated.lifetimeValue,
      },
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: any) {
    console.error("Create customer error:", error);
    return NextResponse.json({ error: error.message || "Failed to create customer" }, { status: 400 });
  }
}
