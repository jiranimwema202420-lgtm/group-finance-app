import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeEnv(name: string) {
  const value = process.env[name]?.trim() ?? "";

  return {
    exists: Boolean(value),
    length: value.length,
    preview: value ? `${value.slice(0, 5)}...${value.slice(-5)}` : null,
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    selectedConsumerKeySource: process.env.DARAJA_CONSUMER_KEY?.trim()
      ? "DARAJA_CONSUMER_KEY"
      : process.env.MPESA_CONSUMER_KEY?.trim()
        ? "MPESA_CONSUMER_KEY"
        : null,

    selectedConsumerSecretSource: process.env.DARAJA_CONSUMER_SECRET?.trim()
      ? "DARAJA_CONSUMER_SECRET"
      : process.env.MPESA_CONSUMER_SECRET?.trim()
        ? "MPESA_CONSUMER_SECRET"
        : null,

    DARAJA_ENV: process.env.DARAJA_ENV?.trim() ?? null,
    DARAJA_CONSUMER_KEY: safeEnv("DARAJA_CONSUMER_KEY"),
    DARAJA_CONSUMER_SECRET: safeEnv("DARAJA_CONSUMER_SECRET"),
    MPESA_CONSUMER_KEY: safeEnv("MPESA_CONSUMER_KEY"),
    MPESA_CONSUMER_SECRET: safeEnv("MPESA_CONSUMER_SECRET"),
    DARAJA_STK_SHORTCODE: process.env.DARAJA_STK_SHORTCODE?.trim() ?? null,
    DARAJA_STK_PASSKEY: safeEnv("DARAJA_STK_PASSKEY"),
    DARAJA_CALLBACK_URL: process.env.DARAJA_CALLBACK_URL?.trim() ?? null,
  });
}
