import { NextResponse } from "next/server";
import { DarajaApiError, getDarajaClient } from "@/lib/daraja";

export const runtime = "nodejs";

export async function GET() {
  try {
    const token = await getDarajaClient().getAccessToken();

    return NextResponse.json({
      ok: true,
      message: "Daraja OAuth token generated successfully.",
      tokenLength: token.length,
      tokenPreview: `${token.slice(0, 8)}...${token.slice(-6)}`,
    });
  } catch (error) {
    if (error instanceof DarajaApiError) {
      return NextResponse.json(
        {
          ok: false,
          stage: "oauth",
          error: error.message,
          payload: error.payload,
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        stage: "oauth",
        error:
          error instanceof Error
            ? error.message
            : "OAuth token test failed.",
      },
      { status: 500 }
    );
  }
}
