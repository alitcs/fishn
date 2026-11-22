export type ExperienceId = "shoreline-fishing" | "ice-fishing";
export type LocationId = "lake-simcoe" | "holland-river" | "nottawasaga-river";
export const experiences = [
  {
    id: "shoreline-fishing" as const,
    name: "Shoreline Fishing",
    short: "By the water.",
    image: "closeupreelandmug",
    alt: "A fishing reel and green mug beside a flowing river",
    tagline: "Find your own kind of quiet.",
    description:
      "A cast, a conversation, a moment to take it all in. Discover Ontario’s shores with someone who knows the water.",
    locations: [
      "lake-simcoe",
      "holland-river",
      "nottawasaga-river",
    ] as LocationId[],
    label: "RIVERS & LAKES",
    journal: ["fishinnet", "waterlandscape", "fishonrock", "lure"],
  },
  {
    id: "ice-fishing" as const,
    name: "Ice Fishing",
    short: "A different kind of still.",
    image: "Lake-simcoe-ice",
    alt: "A broad frozen Lake Simcoe with small ice huts in the distance",
    tagline: "Winter has a quieter side.",
    description:
      "A wide-open winter landscape. Something new beneath the surface. Discover a different side of Lake Simcoe, guided by Nikita.",
    locations: ["lake-simcoe"] as LocationId[],
    label: "LAKE SIMCOE",
    journal: [
      "icefishinglandscape",
      "monsterfish1",
      "icefishingtail",
      "icefishinglandscape1",
      "icefishtail",
      "monsterheadfish1",
      "icefishinglandscape2",
      "icefishtail3",
      "monsterfish",
      "monsterfish2",
      "monsterfish3",
      "winterpath",
    ],
  },
];
export const durationOptions = [1, 2, 3, 4] as const;
export interface AvailabilityRule {
  mode: "request-only";
  enabled: boolean;
  minimumLeadDays: number;
  maxAdvanceDays: number;
  blockedDates: string[];
  allowedWeekdays: number[];
  /** Optional owner-reviewed request window. These are never confirmed slots. */
  requestWindows: { start: string; end: string }[];
}
// No operating hours or seasonal opening dates are invented. Every request needs review.
export const availability: Record<ExperienceId, AvailabilityRule> = {
  "shoreline-fishing": {
    mode: "request-only",
    enabled: true,
    minimumLeadDays: 1,
    maxAdvanceDays: 365,
    blockedDates: [],
    allowedWeekdays: [0, 1, 2, 3, 4, 5, 6],
    requestWindows: [],
  },
  "ice-fishing": {
    mode: "request-only",
    enabled: true,
    minimumLeadDays: 1,
    maxAdvanceDays: 365,
    blockedDates: [],
    allowedWeekdays: [0, 1, 2, 3, 4, 5, 6],
    requestWindows: [],
  },
};
export function ontarioToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((p) => p.type === type)!.value)
    .join("-");
}
export function isRequestDateAllowed(
  date: string,
  experience: ExperienceId,
  now = new Date(),
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const requested = new Date(`${date}T12:00:00Z`);
  if (
    !Number.isFinite(requested.getTime()) ||
    requested.toISOString().slice(0, 10) !== date
  )
    return false;
  const today = new Date(`${ontarioToday(now)}T12:00:00Z`);
  const days = Math.round((requested.getTime() - today.getTime()) / 86400000);
  const rule = availability[experience];
  return (
    rule.enabled &&
    days >= rule.minimumLeadDays &&
    days <= rule.maxAdvanceDays &&
    rule.allowedWeekdays.includes(requested.getUTCDay()) &&
    !rule.blockedDates.includes(date) &&
    (!rule.requestWindows.length ||
      rule.requestWindows.some((w) => date >= w.start && date <= w.end))
  );
}
export const officialLinks = {
  licence:
    "https://www.ontario.ca/page/fishing-licence-ontario-and-canadian-residents",
  regulations:
    "https://www.ontario.ca/document/ontario-fishing-regulations-summary",
  visitors:
    "https://www.ontario.ca/document/ontario-fishing-regulations-summary/recreational-fishing-licences-and-fees",
  instagram: "https://www.instagram.com/nikita.troff/",
};
