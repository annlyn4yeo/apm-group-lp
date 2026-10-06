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

export type OperatingDivision = (typeof OPERATING_DIVISIONS)[number];
