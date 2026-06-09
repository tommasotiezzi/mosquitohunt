export const TIERS = [
  { min: 99, title: "APEX PREDATOR" },
  { min: 90, title: "THE SWAMP'S NIGHTMARE" },
  { min: 75, title: "SEASONED SLAYER" },
  { min: 50, title: "WEEKEND WARRIOR" },
  { min: 25, title: "CASUAL SWATTER" },
  { min: 0, title: "MOSQUITO BUFFET" },
];
export const tierFor = (p: number) => (TIERS.find((t) => p >= t.min) || TIERS[TIERS.length - 1]).title;
export const LINES = [
  "The swamp fears this one.", "No witnesses. No survivors.",
  "Itchy. Vengeful. Unstoppable.", "Another buzz, silenced.",
  "Public health, one slap at a time.", "It bit first. It died last.",
];
