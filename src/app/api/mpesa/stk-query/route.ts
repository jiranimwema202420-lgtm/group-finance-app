import { NextRequest, NextResponse } from "next/server";
import { DarajaApiError, getDarajaClient } from "@/lib/daraja";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const checkoutRequestId = String(body.checkoutRequestId ?? "");

    if (!checkoutRequestId) {
      return NextResponse.json(
        { ok: false, error: "checkoutRequestId is required." },
        { status: 400 }
      );
    }

    const result = await getDarajaClient().stkQuery({
      checkoutRequestId,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    if (error instanceof DarajaApiError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          payload: error.payload,
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to query STK Push.",
      },
      { status: 500 }
    );
  }
}
