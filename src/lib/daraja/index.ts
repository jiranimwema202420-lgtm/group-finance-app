export type DarajaEnv = "sandbox" | "production";

export class DarajaApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "DarajaApiError";
    this.status = status;
    this.payload = payload;
  }
}

type DarajaClientConfig = {
  environment: DarajaEnv;
  consumerKey: string;
  consumerSecret: string;
  stkShortCode: string;
  stkPassKey: string;
};

type StkPushInput = {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
};

type StkQueryInput = {
  checkoutRequestId: string;
};

let cachedToken: {
  token: string;
  expiresAt: number;
} | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getDarajaClient() {
  const environment = (process.env.DARAJA_ENV ?? "sandbox") as DarajaEnv;

  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("DARAJA_ENV must be sandbox or production.");
  }

  return new DarajaClient({
    environment,
    consumerKey: getRequiredEnv("DARAJA_CONSUMER_KEY"),
    consumerSecret: getRequiredEnv("DARAJA_CONSUMER_SECRET"),
    stkShortCode: getRequiredEnv("DARAJA_STK_SHORTCODE"),
    stkPassKey: getRequiredEnv("DARAJA_STK_PASSKEY"),
  });
}

export class DarajaClient {
  private config: DarajaClientConfig;

  constructor(config: DarajaClientConfig) {
    this.config = config;
  }

  private get baseUrl() {
    return this.config.environment === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
  }

  async getAccessToken() {
    // Token cache disabled during Daraja sandbox debugging.

    const credentials = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString("base64");

    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        cache: "no-store",
      }
    );

    const payload = await readDarajaPayload(response);

    if (!response.ok || !payload.access_token) {
      throw new DarajaApiError(
        payload.errorMessage ?? "Failed to generate Daraja access token.",
        response.status,
        payload
      );
    }

    const expiresInSeconds = Number(payload.expires_in || 3599);

    cachedToken = {
      token: payload.access_token,
      expiresAt: Date.now() + Math.max(expiresInSeconds - 60, 60) * 1000,
    };

    return payload.access_token;
  }

  async stkPush(input: StkPushInput) {
    const timestamp = createDarajaTimestamp();
    const password = createStkPassword(
      this.config.stkShortCode,
      this.config.stkPassKey,
      timestamp
    );

    const phoneNumber = normalizeKenyaPhoneNumber(input.phoneNumber);

    return this.post("/mpesa/stkpush/v1/processrequest", {
      BusinessShortCode: this.config.stkShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(input.amount),
      PartyA: phoneNumber,
      PartyB: this.config.stkShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: input.callbackUrl,
      AccountReference: input.accountReference,
      TransactionDesc: input.transactionDesc,
    });
  }

  async stkQuery(input: StkQueryInput) {
    const timestamp = createDarajaTimestamp();
    const password = createStkPassword(
      this.config.stkShortCode,
      this.config.stkPassKey,
      timestamp
    );

    return this.post("/mpesa/stkpushquery/v1/query", {
      BusinessShortCode: this.config.stkShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: input.checkoutRequestId,
    });
  }

  private async post(path: string, body: unknown) {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await readDarajaPayload(response);

    if (!response.ok || payload.errorCode) {
      throw new DarajaApiError(
        payload.errorMessage ?? "Daraja API request failed.",
        response.status,
        payload
      );
    }

    return payload;
  }
}

async function readDarajaPayload(response: Response): Promise<any> {
  const text = await response.text();

  if (!text) {
    return {
      raw: "",
      errorMessage: `Empty response from Daraja. HTTP ${response.status}.`,
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      raw: text,
      errorMessage: `Non-JSON response from Daraja. HTTP ${response.status}.`,
    };
  }
}

export function createDarajaTimestamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function createStkPassword(
  shortCode: string,
  passKey: string,
  timestamp: string
) {
  return Buffer.from(`${shortCode}${passKey}${timestamp}`).toString("base64");
}

export function normalizeKenyaPhoneNumber(rawPhone: string) {
  const digits = rawPhone.replace(/\D/g, "");

  if (!digits) {
    throw new Error("Phone number is required.");
  }

  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) {
    return `254${digits}`;
  }

  throw new Error(
    "Invalid Kenya phone number. Use 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, or 2541XXXXXXXX."
  );
}


