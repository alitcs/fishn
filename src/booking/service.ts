import type { BookingInput, BookingResponse } from "./schema";
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
    response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": data.requestId,
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new BookingError(
      "We couldn’t verify delivery. Please try again with the same details; your request is protected against duplicate delivery.",
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
