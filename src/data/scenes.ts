import type { ExperienceId, LocationId } from "./config";

// One source of truth for narrative scenes and booking backdrops.
export const tripScenes = [
  {
    id: "simcoe-shore",
    location: "lake-simcoe",
    experience: "shoreline-fishing",
    image: "lake-simcoe",
    alt: "The last light of the day over Lake Simcoe, with still water and a rocky shoreline",
    title: ["Room to", "breathe."],
    note: "THE OPEN-WATER EDITION",
    copy: "A wide horizon. A quiet shoreline. Let the rest of the world drift a little further away.",
    focal: "50% 54%",
  },
  {
    id: "holland-shore",
    location: "holland-river",
    experience: "shoreline-fishing",
    image: "HollandRiver",
    alt: "Clouds and trees reflected in the calm Holland River",
    title: ["Take the", "slower way."],
    note: "FOLLOW THE RIVER",
    copy: "The river finds its own pace. A cast, a conversation, and nowhere else you need to be.",
    focal: "60% 55%",
  },
  {
    id: "nottawasaga-shore",
    location: "nottawasaga-river",
    experience: "shoreline-fishing",
    image: "Nottawasaga-River",
    alt: "Sunlight breaking through the clouds above the tree-lined Nottawasaga River",
    title: ["A little", "untamed."],
    note: "LET CURIOSITY LEAD",
    copy: "Moving water. Changing light. Find something new in the places that have always been here.",
    focal: "50% 54%",
  },
  {
    id: "simcoe-ice",
    location: "lake-simcoe",
    experience: "ice-fishing",
    image: "Lake-simcoe-ice",
    alt: "A wide frozen Lake Simcoe with small ice fishing huts on the horizon",
    title: ["Another season.", "Another world."],
    note: "THE WINTER EDITION",
    copy: "A different kind of still. Wide-open winter, and a little anticipation beneath the surface.",
    focal: "55% 58%",
  },
] as const;

export function getTripScene(location: LocationId, experience: ExperienceId) {
  return (
    tripScenes.find(
      (scene) => scene.location === location && scene.experience === experience,
    ) ?? tripScenes[0]
  );
}
