import type { BookingInput, BookingResponse } from "./schema";
import {
  bookingProvider,
  encodeNetlifyBooking,
  netlifyFormEndpoint,
} from "./netlify";
export class BookingError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
// Replace this boundary with a CRM adapter later. Never infer submission from a button click.
export async function submitBooking(
  data: BookingInput,
): Promise<BookingResponse> {
  let response: Response;
  try {
    if (bookingProvider === "netlify") {
      response = await fetch(netlifyFormEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeNetlifyBooking(data).toString(),
        signal: AbortSignal.timeout(20000),
      });
      // Netlify returns an HTML/empty success response, not the legacy JSON receipt.
      // Reject an unprocessed blueprint or a generic SPA fallback on other hosts.
      const receipt = await response.text();
      if (
        !response.ok ||
        receipt.includes("data-fishn-form-blueprint") ||
        /id=["']root["']/.test(receipt)
      )
        throw new BookingError(
          "Your request couldn’t be submitted. Please try again or message Nikita on Instagram.",
        );
      return {
        requestId: data.requestId,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
    }
    response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": data.requestId,
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (error instanceof BookingError) throw error;
    throw new BookingError(
      bookingProvider === "netlify"
        ? "We couldn’t verify submission. Your details are still here. Please try again or message Nikita on Instagram."
        : "We couldn’t verify delivery. Please try again with the same details; your request is protected against duplicate delivery.",
    );
  }
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new BookingError(
      result?.message ??
        "Your request couldn’t be sent. Your selections are still here. Please try again.",
      result?.fields ?? {},
    );
  if (!result?.requestId || result?.status !== "pending")
    throw new BookingError(
      "We couldn’t verify your request. Please try again.",
    );
  return result;
}
