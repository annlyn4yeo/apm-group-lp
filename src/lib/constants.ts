export const SITE_URL = "https://apmgroups.com";
export const SITE_NAME = "APM Groups of Company";
export const SITE_DESCRIPTION = "A diversified industrial group building enduring value across energy, land, infrastructure, property, manufacturing, and materials.";

/**
 * Canonical operating-division taxonomy. Single source of truth consumed by
 * Services, Our Business, Gallery filters, and the Footer — see DESIGN.md
 * §01 item 2 and §06 for why this list (not "Windmill" / "Steel Plant" /
 * the About section's 6-item founding list) is the one structured data
 * source every section reads from.
 */
export const OPERATING_DIVISIONS = [
  { name: "APM Wind Energy", tag: "Renewable Power" },
  { name: "APM Plantation", tag: "Agri Cultivation" },
  { name: "APM Construction", tag: "Civil Infrastructure" },
  { name: "APM Real Estate", tag: "Property Development" },
  { name: "APM Plaza", tag: "Retail & Commercial" },
  { name: "APM Textiles", tag: "Advanced Spinning" },
  { name: "APM Steels", tag: "Heavy Metallurgy" },
] as const;

/**
 * The six founding-era interests shown in About's "Diversified Operations"
 * strip (DESIGN.md §01 item 3). Deliberately not the 7-item taxonomy above:
 * APM Plaza joins later in the story.
 */
export const FOUNDING_INTERESTS = [
  "Wind Energy",
  "Plantation",
  "Textiles",
  "Construction",
  "Steel Plant",
  "Real Estate",
] as const;

export type OperatingDivision = (typeof OPERATING_DIVISIONS)[number];

/**
 * Capability lines for the Services section, keyed by canonical division name.
 * Each list is the Services table description from the content document,
 * split at its commas, so the copy is unchanged and only its shape differs.
 */
export const SERVICE_CAPABILITIES: Record<OperatingDivision["name"], readonly string[]> = {
  "APM Wind Energy": [
    "Clean energy generation",
    "Wind farm lifecycle management",
    "Generator maintenance",
    "Regional power grid transmission",
  ],
  "APM Plantation": [
    "Large-scale horticulture",
    "Cash crop farming",
    "Sustainable agro-forestry",
    "Soil preservation",
    "Biological land stewardship",
  ],
  "APM Construction": [
    "Institutional civil engineering",
    "Infrastructure contracting",
    "Utility corridors",
    "Heavy reinforced commercial structures",
  ],
  "APM Real Estate": [
    "Master-planned residential communities",
    "Strategic urban property development",
    "Land banking",
    "Modern housing environments",
  ],
  "APM Plaza": [
    "Prime retail destinations",
    "Shopping complexes",
    "High-footfall commercial plazas",
    "Flexible institutional asset leasing",
  ],
  "APM Textiles": [
    "High-specification spinning mills",
    "Precision fabric manufacturing",
    "Automated yarn spinning",
    "Export supply chain logistics",
  ],
  "APM Steels": [
    "Precision structural steel fabrication",
    "High-yield industrial TMT rebars",
    "Heavy metal distribution",
    "Bulk commercial orders for infrastructure projects",
  ],
};

/**
 * Achievements carousel content (content document §5). `title` is the award
 * name broken into its display lines; `label` is the short form used on the
 * carousel's progress control.
 */
export const ACHIEVEMENTS = [
  {
    title: ["Master of", "Achievement Award"],
    label: "Master of Achievement",
    category: "Leadership Commendation",
    description:
      "Prestigious commendation recognizing visionary entrepreneurial excellence, institutional integrity, and transformative multi-industry enterprise impact.",
  },
  {
    title: ["Millennium 2000", "Award for Green Revolution"],
    label: "Millennium 2000",
    category: "Environmental Excellence",
    description:
      "Distinguished institutional honor celebrating pioneering efforts in renewable wind energy, agricultural forestry, and ecological preservation.",
  },
] as const;
