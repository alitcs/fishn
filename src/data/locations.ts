import type { LocationId } from "./config";
export const locations = [
  {
    id: "lake-simcoe" as LocationId,
    name: "Lake Simcoe",
    image: "lake-simcoe",
    alt: "Sunset reflecting across Lake Simcoe with a rocky shoreline",
    region: "SOUTH-CENTRAL ONTARIO",
    intro: "Big skies. Open water. A little perspective.",
    description:
      "With 722 square kilometres of water, Lake Simcoe offers room to slow down. Explore its shoreline, or request an ice fishing day when conditions and the fishing season allow.",
    facts: [
      ["WATER", "Freshwater lake"],
      ["SURFACE AREA", "Approximately 722 km²"],
      ["EXPERIENCES", "Shoreline & ice fishing"],
    ],
    source: "https://www.ontario.ca/page/protecting-lake-simcoe",
    sourceName: "Ontario · Lake Simcoe",
    maps: "Lake Simcoe, Ontario, Canada",
  },
  {
    id: "holland-river" as LocationId,
    name: "Holland River",
    image: "HollandRiver",
    alt: "Clouds reflected in the calm, tree-lined Holland River",
    region: "LAKE SIMCOE WATERSHED",
    intro: "Take the slower way to the lake.",
    description:
      "Part of the Lake Simcoe watershed, the Holland River connects a landscape of riverbanks and wetlands. The East and West Holland subwatersheds each have their own character. Settle into a day beside the water.",
    facts: [
      ["WATER", "River system"],
      ["WATERSHED", "Lake Simcoe"],
      ["EXPERIENCE", "Shoreline fishing"],
    ],
    source: "https://lsrca.on.ca/index.php/home/subwatershed-plans/",
    sourceName: "Lake Simcoe Region Conservation Authority",
    maps: "Holland River, Ontario, Canada",
  },
  {
    id: "nottawasaga-river" as LocationId,
    name: "Nottawasaga River",
    image: "Nottawasaga-River",
    alt: "Sunlight breaking through clouds above the forest-lined Nottawasaga River",
    region: "GEORGIAN BAY WATERSHED",
    intro: "Follow the river. Find a little wonder.",
    description:
      "The Nottawasaga flows through the Niagara Escarpment and the Minesing Wetlands on its way to Georgian Bay. A river with a rich natural story, and a place to spend a little more time looking around.",
    facts: [
      ["WATER", "River system"],
      ["FLOWS TO", "Georgian Bay"],
      ["EXPERIENCE", "Shoreline fishing"],
    ],
    source:
      "https://www.nvca.on.ca/lands-stewardship/restoring-the-nottawasaga-river/",
    sourceName: "Nottawasaga Valley Conservation Authority",
    maps: "Nottawasaga River, Ontario, Canada",
  },
];
export const mapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
