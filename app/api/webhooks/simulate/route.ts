import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventType = "payment.failed",
      amount = 4999,
      method = "upi",
      errorCode = "GATEWAY_TIMEOUT",
      errorDescription = "HDFC Bank UPI Switch not responding",
      email = "aarav.sharma@example.com",
      name = "Aarav Sharma",
      vpa = "aarav@okhdfcbank",
    } = body;

    const payload = {
      entity: "event",
      account_id: "acc_sandbox_razorrecover",
      event: eventType,
      contains: ["payment"],
      payload: {
        payment: {
          entity: {
            id: `pay_sim_${Math.random().toString(36).substring(2, 10)}`,
            amount: amount * 100, // paise
            currency: "INR",
            status: "failed",
            order_id: `order_sim_${Math.random().toString(36).substring(2, 10)}`,
            method,
            email,
            contact: "+919876543210",
            name,
            vpa,
            error_code: errorCode,
            error_description: errorDescription,
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    // Forward to internal webhook endpoint
    const baseUrl = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "";
    const res = await fetch(`${baseUrl}/api/webhooks/razorpay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "simulated_test_sig_2026",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json({ success: true, simulatedPayload: payload, webhookResponse: data });
  } catch (error: any) {
    console.error("Webhook simulate error:", error);
    return NextResponse.json({ error: error.message || "Failed to simulate webhook" }, { status: 500 });
  }
}
