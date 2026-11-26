import type { BookingInput } from "./schema";
import { experiences } from "../data/config";
import { locations } from "../data/locations";
import { tripPrice } from "../data/pricing";

export const netlifyFormName = "fishing-session";
export const netlifyFormEndpoint = "/__forms.html";

export function encodeNetlifyBooking(data: BookingInput) {
  const price = tripPrice(data.experience, data.groupSize, data.duration);
  const fields: Record<string, string> = {
    "form-name": netlifyFormName,
    subject: "New fishn session request",
    requestId: data.requestId,
    clientSubmittedAt: data.clientSubmittedAt,
    name: data.name,
    email: data.email,
    phone: data.phone,
    experience: data.experience,
    experienceName: experiences.find((item) => item.id === data.experience)!
      .name,
    location: data.location,
    locationName: locations.find((item) => item.id === data.location)!.name,
    groupSize: String(data.groupSize),
    duration: String(data.duration),
    hourlyRate: String(price.hourlyRate),
    sessionTotal: String(price.total),
    currency: "CAD",
    preferredDate: data.preferredDate,
    licenceAcknowledgement: data.licenceAcknowledgement,
    destinationAdviceRequested: data.destinationAdviceRequested ? "Yes" : "No",
    specialRequests: data.specialRequests || "",
    website: data.website,
    analyticsConsent: String(data.analyticsConsent === true),
  };
  if (data.analyticsConsent && data.attribution)
    for (const [key, value] of Object.entries(data.attribution))
      if (value) fields[key] = value;
  return new URLSearchParams(fields);
}
