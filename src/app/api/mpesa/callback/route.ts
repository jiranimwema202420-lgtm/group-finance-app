import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  console.log("[M-PESA STK CALLBACK]", JSON.stringify(payload, null, 2));

  return NextResponse.json({
    ResultCode: 0,
    ResultDesc: "Accepted",
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "M-Pesa STK callback endpoint",
  });
}
