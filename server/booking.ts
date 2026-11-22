import { bookingSchema, licenceOptions } from "../src/booking/schema";
import type { BookingInput } from "../src/booking/schema";
import { experiences } from "../src/data/config";
import { locations } from "../src/data/locations";
import { tripIntents, fishingLevels } from "../src/data/booking";
import { formatPrice, tripPrice } from "../src/data/pricing";

export interface BookingEnv {
  RESEND_API_KEY?: string;
  BOOKING_NOTIFICATION_EMAIL?: string;
  BOOKING_FROM_EMAIL?: string;
}
const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export const isConfigured = (env: BookingEnv) =>
  Boolean(
    env.RESEND_API_KEY &&
    env.BOOKING_NOTIFICATION_EMAIL &&
    env.BOOKING_FROM_EMAIL,
  );
export function bookingEmail(data: BookingInput, submittedAt: string) {
  return [
    "A new day outside has been requested.",
    "",
    `Request ID: ${data.requestId}`,
    "Status: Pending — not confirmed",
    `Customer submission time (UTC): ${submittedAt}`,
    "Server receipt time is recorded by the email delivery provider.",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    "",
    `Experience: ${experiences.find((e) => e.id === data.experience)!.name}`,
    `Location: ${locations.find((l) => l.id === data.location)!.name}`,
    `Group: ${data.groupSize}`,
    `Duration: ${data.duration} hour(s)`,
    `Hourly rate: ${formatPrice(tripPrice(data.experience, data.groupSize, data.duration).hourlyRate)} CAD`,
    `Session total: ${formatPrice(tripPrice(data.experience, data.groupSize, data.duration).total)} CAD; all fishing gear and equipment included.`,
    `Preferred date (Ontario): ${data.preferredDate}`,
    `Licence acknowledgement: ${licenceOptions.find((l) => l.value === data.licenceAcknowledgement)!.label}`,
    "Licence acknowledgement is self-reported, not legal verification.",
    ...(data.tripIntent
      ? [
          `Kind of day: ${tripIntents.find((option) => option.value === data.tripIntent)!.label}`,
        ]
      : []),
    ...(data.fishingLevel
      ? [
          `Fishing experience: ${fishingLevels.find((option) => option.value === data.fishingLevel)!.label}`,
        ]
      : []),
    ...(data.destinationAdviceRequested
      ? [
          "Destination advice: Please help the customer choose. The selected destination is a starting suggestion.",
        ]
      : []),
    ...(data.specialRequests
      ? ["", "Customer note (optional):", data.specialRequests]
      : []),
    "",
    "Review the season, regulations, permissions, access, weather and (where relevant) ice conditions. Agree the meeting point and pricing directly with the customer.",
    ...(data.analyticsConsent && data.attribution
      ? [
          "",
          "Consented campaign attribution:",
          ...Object.entries(data.attribution).map(
            ([key, value]) => `${key}: ${value}`,
          ),
        ]
      : []),
  ].join("\n");
}
// A process-level abuse backstop. Use the host/WAF for durable distributed rate limiting.
const attempts = new Map<string, { count: number; reset: number }>();
export async function handleBooking(
  request: Request,
  env: BookingEnv,
  send: typeof fetch = fetch,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === "/api/booking/status" && request.method === "GET")
    return json({ ready: isConfigured(env) });
  if (request.method !== "POST")
    return json({ message: "Method not allowed." }, 405);
  const origin = request.headers.get("Origin");
  if (
    !origin ||
    origin !== url.origin ||
    request.headers.get("Sec-Fetch-Site") === "cross-site"
  )
    return json(
      { message: "Please submit your request from the fishn website." },
      403,
    );
  if (
    !request.headers
      .get("Content-Type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return json({ message: "Please send a JSON request." }, 415);
  if (Number(request.headers.get("Content-Length")) > 16384)
    return json({ message: "Request is too large." }, 413);
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return json({ message: "Could not read the request." }, 400);
  }
  if (new TextEncoder().encode(raw).length > 16384)
    return json({ message: "Request is too large." }, 413);
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return json({ message: "Please check your request." }, 400);
  }
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const fields = Object.fromEntries(
      parsed.error.issues.map((i) => [i.path[0] ?? "form", i.message]),
    );
    return json(
      { message: "Please check the highlighted details.", fields },
      422,
    );
  }
  const data = parsed.data;
  if (request.headers.get("Idempotency-Key") !== data.requestId)
    return json({ message: "Request identifier does not match." }, 400);
  if (!isConfigured(env))
    return json(
      {
        message:
          "Online requests aren’t open yet. Contact Nikita on Instagram to plan your day. Your selections are saved here.",
      },
      503,
    );
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Real-IP") ||
    "local";
  const now = Date.now();
  let limit = attempts.get(ip);
  if (!limit || limit.reset <= now) {
    limit = { count: 0, reset: now + 600000 };
    attempts.set(ip, limit);
  }
  if (limit.count >= 10)
    return json(
      { message: "A few too many requests. Please try again in ten minutes." },
      429,
    );
  limit.count++;
  if (attempts.size > 1000)
    for (const [key, value] of attempts)
      if (value.reset < now) attempts.delete(key);
  // Stable per-request text is essential for Resend idempotency across retries.
  // Client submission time is validated; provider receipt headers record trusted server time.
  const timestamp = new Date().toISOString();
  const payload = {
    from: env.BOOKING_FROM_EMAIL!,
    to: [env.BOOKING_NOTIFICATION_EMAIL!],
    reply_to: data.email,
    subject: `fishn · ${experiences.find((e) => e.id === data.experience)!.name} request · ${data.preferredDate}`,
    text: bookingEmail(data, data.clientSubmittedAt),
  };
  let delivered: Response;
  try {
    delivered = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `fishn-booking/${data.requestId}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    return json(
      {
        message:
          "Delivery could not be verified. Please try again; the same request won’t be emailed twice within 24 hours.",
      },
      502,
    );
  }
  if (!delivered.ok)
    return json(
      {
        message:
          "Your request couldn’t be delivered. Please try again or contact Nikita on Instagram. Your details are still here.",
      },
      502,
    );
  const receipt = (await delivered.json().catch(() => null)) as {
    id?: string;
  } | null;
  if (!receipt?.id)
    return json(
      { message: "Delivery could not be verified. Please try again." },
      502,
    );
  // Verified server-side delivery is the durable record until the CRM is connected.
  return json(
    { requestId: data.requestId, status: "pending", submittedAt: timestamp },
    201,
  );
}
