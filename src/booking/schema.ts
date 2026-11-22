import { z } from "zod";
import {
  durationOptions,
  experiences,
  isRequestDateAllowed,
} from "../data/config";
export const licenceOptions = [
  { value: "valid", label: "Yes, I have a valid licence." },
  { value: "exempt", label: "I’m exempt." },
  {
    value: "before-trip",
    label: "I’ll get the required licence before my trip.",
  },
] as const;
export const bookingSchema = z
  .object({
    requestId: z.uuid(),
    clientSubmittedAt: z.iso.datetime().refine((value) => {
      const age = Date.now() - Date.parse(value);
      return age >= -300000 && age <= 86400000;
    }, "Please refresh the page and submit again."),
    name: z.string().trim().min(2, "Please enter your full name.").max(100),
    email: z.email("Please enter a valid email address.").max(254),
    phone: z
      .string()
      .trim()
      .min(7, "Please enter a phone number.")
      .max(30)
      .regex(/^[+\d\s().-]+$/, "Please enter a valid phone number.")
      .refine(
        (v) => v.replace(/\D/g, "").length >= 7,
        "Please enter a valid phone number.",
      ),
    experience: z.enum(["shoreline-fishing", "ice-fishing"]),
    location: z.enum(["lake-simcoe", "holland-river", "nottawasaga-river"]),
    groupSize: z.number().int().min(1),
    duration: z
      .number()
      .refine(
        (v) => durationOptions.includes(v as (typeof durationOptions)[number]),
        "Please choose a 2, 4, 6, or 8 hour trip.",
      ),
    preferredDate: z.string().min(1, "Please choose a preferred date."),
    licenceAcknowledgement: z.enum(["valid", "exempt", "before-trip"], {
      error: "Please acknowledge the fishing licence requirements.",
    }),
    tripIntent: z
      .enum(["escape", "first-time", "together", "focused"])
      .optional(),
    fishingLevel: z.enum(["new", "some", "regular"]).optional(),
    destinationAdviceRequested: z.boolean().optional(),
    specialRequests: z
      .string()
      .trim()
      .max(1500, "Please keep your note under 1,500 characters.")
      .optional(),
    website: z.string().max(0),
    attribution: z
      .object({
        utm_source: z.string().max(200).optional(),
        utm_medium: z.string().max(200).optional(),
        utm_campaign: z.string().max(200).optional(),
        utm_content: z.string().max(200).optional(),
        utm_term: z.string().max(200).optional(),
        fbclid: z.string().max(200).optional(),
      })
      .strict()
      .optional(),
    analyticsConsent: z.boolean().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      !experiences
        .find((e) => e.id === data.experience)!
        .locations.includes(data.location)
    )
      ctx.addIssue({
        code: "custom",
        path: ["location"],
        message: "Please choose a location for this experience.",
      });
    if (!isRequestDateAllowed(data.preferredDate, data.experience))
      ctx.addIssue({
        code: "custom",
        path: ["preferredDate"],
        message:
          "Please choose a request date within the current request window.",
      });
    if (data.attribution && !data.analyticsConsent)
      ctx.addIssue({
        code: "custom",
        path: ["attribution"],
        message: "Attribution requires analytics consent.",
      });
  });
export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingStatus =
  "pending" | "contacted" | "confirmed" | "completed" | "cancelled";
export interface BookingRecord extends BookingInput {
  status: BookingStatus;
  submittedAt: string;
  deliveryId: string;
}
export interface BookingResponse {
  requestId: string;
  status: "pending";
  submittedAt: string;
}
