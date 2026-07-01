import { NextRequest, NextResponse } from "next/server";
import { DarajaApiError, getDarajaClient } from "@/lib/daraja";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const phoneNumber = String(body.phoneNumber ?? "");
    const amount = Number(body.amount ?? 0);
    const accountReference = String(body.accountReference ?? "JIRANI");
    const transactionDesc = String(
      body.transactionDesc ?? "Jirani Mwema SHG payment"
    );
    const callbackUrl = String(
      body.callbackUrl ?? process.env.DARAJA_CALLBACK_URL ?? ""
    );

    if (!phoneNumber) {
      return NextResponse.json(
        { ok: false, error: "phoneNumber is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: "amount must be greater than zero." },
        { status: 400 }
      );
    }

    if (!callbackUrl) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing callback URL. Set DARAJA_CALLBACK_URL in .env.local.",
        },
        { status: 400 }
      );
    }

    const result = await getDarajaClient().stkPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
      callbackUrl,
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
            : "Failed to start STK Push.",
      },
      { status: 500 }
    );
  }
}
