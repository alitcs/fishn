import type { ExperienceId } from "./config";

export const tripIntents = [
  {
    value: "escape",
    label: "A peaceful escape",
    detail: "Fresh air, a few casts, a slower pace.",
  },
  {
    value: "first-time",
    label: "My first fishing experience",
    detail: "A welcoming place to start.",
  },
  {
    value: "together",
    label: "Time with friends or family",
    detail: "A private day with your people.",
  },
  {
    value: "focused",
    label: "A focused fishing day",
    detail: "Tell Nikita what you would like to work on.",
  },
] as const;
export const fishingLevels = [
  {
    value: "new",
    label: "I’m completely new",
    detail: "Start at your own pace.",
  },
  {
    value: "some",
    label: "I’ve tried it a few times",
    detail: "Build on what you already know.",
  },
  {
    value: "regular",
    label: "I fish regularly",
    detail: "Talk through the day you have in mind.",
  },
] as const;
export type TripIntent = (typeof tripIntents)[number]["value"];
export type FishingLevel = (typeof fishingLevels)[number]["value"];

export function tripGuidance(
  intent: TripIntent | "",
  level: FishingLevel | "",
  experience: ExperienceId,
) {
  if (experience === "ice-fishing")
    return "A new side of Lake Simcoe. Nikita reviews the season, ice conditions, and your plans before agreeing a trip.";
  if (level === "new" || intent === "first-time")
    return "First time? You’re welcome here. Nikita helps you get comfortable and learn at your own pace. Equipment arrangements are discussed before your trip.";
  if (intent === "together")
    return "Your outing is private. Tell us who’s coming, and Nikita will talk through a plan for your group.";
  if (level === "regular" || intent === "focused")
    return "Tell Nikita what you would like to focus on. He’ll discuss the location, conditions, and equipment with you.";
  if (intent === "escape")
    return "A shoreline day is a place to start. Choose the water that appeals to you, or ask Nikita to help you decide.";
  return "Choose a place that appeals to you. No local knowledge needed: Nikita will review the location and details with you.";
}
