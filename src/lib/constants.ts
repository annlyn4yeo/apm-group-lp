export const SITE_URL = "https://apmgroups.com";
export const SITE_NAME = "APM Groups of Company";
export const SITE_DESCRIPTION = "A diversified industrial group building enduring value across energy, land, infrastructure, property, manufacturing, and materials.";

/**
 * Primary navigation, shared by the Navbar and the Footer's quick navigation
 * (DESIGN.md §07: same labels, same hrefs). Contact is the Navbar's CTA, so it
 * is listed separately.
 */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Achievements", href: "#achievements" },
  { label: "Our Business", href: "#divisions" },
  { label: "Gallery", href: "#gallery" },
] as const;

export const CONTACT_LINK = { label: "Contact", href: "#contact" } as const;

/** Registered corporate office (content document §8). */
export const CONTACT_DETAILS = {
  entity: "APM Wind Energy and Plantation Pvt. Ltd.",
  address: "NGL to TVL Main Road, Muppandal, Aralvoimozhi, Kanyakumari Dist, Tamilnadu - 629301",
  website: { label: "www.apmgroups.com", href: "https://www.apmgroups.com" },
  email: "apmgroupofcompanies@gmail.com",
} as const;

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
  { name: "APM Hotels", tag: "Hospitality" },
  { name: "APM Textiles", tag: "Advanced Spinning" },
  { name: "APM Steels", tag: "Heavy Metallurgy" },
] as const;

/**
 * The six founding-era interests shown in About's "Diversified Operations"
 * strip (DESIGN.md §01 item 3). Deliberately not the 7-item taxonomy above:
 * APM Hotels joins later in the story.
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
 * An entry can be a main point with `subpoints` listed beneath it.
 */
export type ServiceCapability = string | { title: string; subpoints: readonly string[] };

export const SERVICE_CAPABILITIES: Record<OperatingDivision["name"], readonly ServiceCapability[]> = {
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
  "APM Hotels": [
    {
      title: "APM Hotels",
      subpoints: [
        "Hotel APM Grand",
        "Hotel APM Heritage",
        "The Delicious Restaurant",
        "Thunders Resto Bar and Cafe",
      ],
    },
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
 * Our Business copy (content document §6), keyed by canonical division name.
 * The descriptions are verbatim; the document's "APM Windmill" is the canonical
 * "APM Wind Energy" here (DESIGN.md §01 item 2). `products` is the document's
 * product chips on the APM Steels feature row.
 */
export const BUSINESS_DETAILS: Record<
  OperatingDivision["name"],
  { description: string; products?: readonly string[] }
> = {
  "APM Wind Energy": {
    description:
      "Large-scale clean energy generation, turbine asset deployment, and power grid feeding driving regional decarbonization.",
  },
  "APM Plantation": {
    description:
      "Responsible agro-farming, sustainable crop cultivation, and biological land conservation across vast fertile estates.",
  },
  "APM Construction": {
    description:
      "Industrial civil engineering, public-private utility corridors, and resilient structural contracting executed to institutional standards.",
  },
  "APM Real Estate": {
    description:
      "Thoughtfully master-planned residential properties, strategic land banking, and modern housing communities.",
  },
  "APM Hotels": {
    description:
      "Hotel APM Grand offers comfortable, well-appointed stays and warm hospitality.",
  },
  "APM Textiles": {
    description:
      "High-grade fabric manufacturing, quality yarn production, and supply chain fulfillment across domestic and international markets.",
  },
  "APM Steels": {
    description:
      "Precision structural steel distribution, specialized metal fabrication, and dependable industrial supply contracts feeding mega-scale construction projects.",
    products: ["Structural I-Beams", "Fabricated Rebar", "High-Tensile Coils"],
  },
};

/**
 * Gallery slides (content document §7), in operating-division order. Categories
 * use the extended set from DESIGN.md §01 item 4 (Textiles and Hospitality
 * included); the Textiles caption is new because the document has no Textiles
 * image, and is taken from the Services copy.
 *
 * PLACEHOLDER IMAGES: `src` points at seeded Picsum photos, which will not
 * depict the captions. Replace each with a real photograph (e.g.
 * `/images/gallery/wind-farm.jpg`) and drop `unoptimized` in Gallery.tsx; the
 * Construction and Wind Energy sources in the live site show portal UI chrome
 * and must not be reused (DESIGN.md §01 item 8).
 */
export const GALLERY_ITEMS = [
  {
    category: "Wind Energy",
    caption: "Wind Farm Generation Site",
    src: "https://picsum.photos/seed/apm-wind-farm/1200/900",
  },
  {
    category: "Plantation",
    caption: "Agro-Farming Estate",
    src: "https://picsum.photos/seed/apm-agro-estate/1200/900",
  },
  {
    category: "Construction",
    caption: "Commercial Engineering Complex",
    src: "https://picsum.photos/seed/apm-engineering-complex/1200/900",
  },
  {
    category: "Real Estate",
    caption: "Master-Planned Communities",
    src: "https://picsum.photos/seed/apm-planned-community/1200/900",
  },
  {
    category: "Hospitality",
    caption: "Hotel APM Grand",
    src: "https://picsum.photos/seed/apm-hotel-grand/1200/900",
  },
  {
    category: "Textiles",
    caption: "High-Specification Spinning Mill",
    src: "https://picsum.photos/seed/apm-spinning-mill/1200/900",
  },
  {
    category: "Steel",
    caption: "Industrial Steel Logistics Hub",
    src: "https://picsum.photos/seed/apm-steel-hub/1200/900",
  },
] as const;

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
