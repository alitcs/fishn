import type { BookingInput, BookingResponse } from "./schema";
import { encodeNetlifyBooking, netlifyFormEndpoint } from "./netlify";
export class BookingError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
export async function submitBooking(
  data: BookingInput,
): Promise<BookingResponse> {
  try {
    const response = await fetch(netlifyFormEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeNetlifyBooking(data).toString(),
      signal: AbortSignal.timeout(20000),
    });
    // Netlify returns an HTML/empty success response.
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
  } catch (error) {
    if (error instanceof BookingError) throw error;
    throw new BookingError(
      "We couldn’t verify submission. Your details are still here. Please try again or message Nikita on Instagram.",
    );
  }
}
