import type { ExperienceId } from "./config";

export const tripRates: Record<ExperienceId, number> = {
  "shoreline-fishing": 50,
  "ice-fishing": 75,
};
export const additionalPersonRates: Record<ExperienceId, number> = {
  "shoreline-fishing": 20,
  "ice-fishing": 25,
};
export function tripPrice(experience: ExperienceId, people: number, hours: number) {
  const baseRate = tripRates[experience];
  const additionalRate = (people - 1) * additionalPersonRates[experience];
  const hourlyRate = baseRate + additionalRate;
  return { baseRate, additionalRate, hourlyRate, total: hourlyRate * hours };
}
export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}
