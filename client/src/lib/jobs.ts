export type Job = {
  id: string;
  title: string;
  company: string;
  url: string;
  source: string;
  location?: string;
  department?: string;
  posted_at?: string;
  role_type?: string;
  track?: string;
  season?: string;
  status?: string;
  work_auth?: string;
  tags?: string[];
  description?: string;
  updated_at?: string;
};

export type JobsResponse = {
  generated_at: string;
  count: number;
  total?: number;
  jobs: Job[];
};

export type Filters = {
  q: string;
  location: string;
  track: string;
  role_type: string;
  season: string;
  source: string;
  company: string;
  work_auth: string;
};

export const labels: Record<string, string> = {
  cs: "CS",
  chemistry: "Chemistry",
  data_tpm: "Data + TPM",
  other: "Other",
  intern: "Intern",
  new_grad: "New Grad",
  entry: "Entry Level",
  unknown: "Unknown",
  sponsors: "Sponsors / OPT-CPT",
  no_sponsorship: "No Sponsorship",
  us_citizen: "Citizen / Clearance",
};

export const filterFields: Array<keyof Pick<Filters, "track" | "role_type" | "season" | "source">> = [
  "track",
  "role_type",
  "season",
  "source",
];

export const savedViews = [
  { id: "all", label: "All" },
  { id: "cs", label: "CS" },
  { id: "chemistry", label: "Chemistry" },
  { id: "data_tpm", label: "Data + TPM" },
  { id: "intern", label: "Intern" },
  { id: "new_grad", label: "New Grad" },
  { id: "us_citizen", label: "Citizen / Clearance" },
];

export const defaultFilters: Filters = {
  q: "",
  location: "",
  track: "all",
  role_type: "all",
  season: "all",
  source: "all",
  company: "all",
  work_auth: "all",
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function title(value?: string) {
  if (!value) return "";
  return labels[value] || value.replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
}

export function apiUrl(path: string) {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
  return `${base}${path}`;
}

export function formatTimestamp(value?: string) {
  if (!value) return "never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day} ${byType.hour}:${byType.minute} ${byType.dayPeriod} ${byType.timeZoneName}`;
}

function parsePostedDate(value?: string) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function jobAge(value?: string) {
  const posted = parsePostedDate(value);
  if (!posted) return "Age unknown";
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.max(0, Math.floor((todayStart.getTime() - posted.getTime()) / 86_400_000));
  if (days === 0) return "Posted today";
  if (days === 1) return "1 day live";
  return `${days} days live`;
}

export type DescriptionBlock = { kind: "paragraph" | "bullet"; text: string };
export type DescriptionSection = { title: string; blocks: DescriptionBlock[] };

function normalText(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
}

// Descriptions can arrive plain, as real HTML, or entity-escaped one or more
// times (e.g. `&amp;lt;p&amp;gt;`). Decode entities until real tags surface or
// there is nothing left to decode — then the parser sees real markup or plain
// text, never literal `&lt;` noise.
function prepareDescription(value?: string): string {
  let markup = value || "";
  for (let pass = 0; pass < 4; pass += 1) {
    if (/<[a-z!/][^>]*>/i.test(markup)) break; // real tags present
    if (!/&(?:lt|gt|amp|quot|apos|nbsp|#\d+|#x[0-9a-f]+);/i.test(markup)) break; // no entities left
    const decoded = new DOMParser().parseFromString(markup, "text/html").body.textContent;
    if (!decoded || decoded === markup) break;
    markup = decoded;
  }
  return markup;
}

function isSectionHeading(value: string) {
  const compact = normalText(value).replace(/:$/, "");
  if (!compact || compact.length > 90) return false;
  return /^(about|who we are|the role|what you('|’)ll|what we|responsibilit|qualifications?|requirements?|skills|benefits|compensation|additional|itar|equal opportunity|preferred|minimum|basic)/i.test(compact)
    || (compact === compact.toUpperCase() && /[A-Z]/.test(compact));
}

export function splitDescriptionSections(raw?: string): DescriptionSection[] {
  const value = prepareDescription(raw);
  const source = normalText(value);
  if (!/<\/?[a-z][^>]*>/i.test(source)) return splitPlainTextSections(source);
  const doc = new DOMParser().parseFromString(value, "text/html");
  const elements = Array.from(doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li"));
  const sections: DescriptionSection[] = [];
  let current: DescriptionSection = { title: "Overview", blocks: [] };
  const addSection = (sectionTitle: string) => {
    if (current.blocks.length) sections.push(current);
    current = { title: normalText(sectionTitle).replace(/:$/, ""), blocks: [] };
  };

  elements.forEach(element => {
    if (element.tagName === "LI" && element.closest("li") !== element) return;
    const text = normalText(element.textContent || "");
    if (!text) return;
    const headingElement = /^H[1-6]$/.test(element.tagName);
    const leadStrong = element.querySelector(":scope > strong, :scope > b");
    const leadTitle = normalText(leadStrong?.textContent || "");

    if (headingElement || (leadStrong && isSectionHeading(leadTitle)) || (element.tagName === "P" && isSectionHeading(text))) {
      const heading = headingElement ? text : leadStrong && isSectionHeading(leadTitle) ? leadTitle : text;
      addSection(heading);
      if (leadStrong && element.tagName === "P" && text !== leadTitle) {
        const remainder = normalText(text.slice(leadTitle.length));
        if (remainder) current.blocks.push({ kind: "paragraph", text: remainder });
      }
      return;
    }

    current.blocks.push({ kind: element.tagName === "LI" ? "bullet" : "paragraph", text });
  });

  if (current.blocks.length) sections.push(current);
  if (sections.length) return sections;
  const fallback = normalText(doc.body.textContent || "");
  return fallback ? [{ title: "Overview", blocks: [{ kind: "paragraph", text: fallback }] }] : [];
}

const plainTextHeadings = [
  "WHO WE ARE",
  "ABOUT THE (?:ROLE|POSITION)",
  "WHAT YOU(?:'|’)LL (?:ACHIEVE|WORK ON|DO)",
  "AREAS YOU MIGHT WORK ON",
  "(?:SKILLS|QUALIFICATIONS) YOU(?:'|’)LL NEED TO BRING",
  "NICE TO HAVES?",
  "PREFERRED QUALIFICATIONS",
  "BASIC QUALIFICATIONS",
  "MINIMUM QUALIFICATIONS",
  "ITAR REQUIREMENTS",
  "EQUAL OPPORTUNITY(?: & ACCOMMODATIONS)?",
  "A NOTE ON AI",
];

function proseBlocks(value: string): DescriptionBlock[] {
  const bulletParts = value.split(/\s+-\s+(?=[A-Z])/).map(normalText).filter(Boolean);
  return bulletParts.flatMap((part, index) => {
    if (index > 0) return [{ kind: "bullet" as const, text: part }];
    const sentences = part.split(/(?<=[.!?])\s+(?=[A-Z“])/).map(normalText).filter(Boolean);
    const paragraphs: DescriptionBlock[] = [];
    for (let cursor = 0; cursor < sentences.length; cursor += 2) {
      paragraphs.push({ kind: "paragraph", text: sentences.slice(cursor, cursor + 2).join(" ") });
    }
    return paragraphs;
  });
}

function readableHeading(value: string) {
  return value.toLowerCase().replace(/\b\w/g, character => character.toUpperCase());
}

function splitPlainTextSections(value: string): DescriptionSection[] {
  if (!value) return [];
  const pattern = new RegExp(`(?:^|\\s)(${plainTextHeadings.join("|")})(?=\\s|:|-)`, "g");
  const matches = [...value.matchAll(pattern)];
  if (!matches.length) return [{ title: "Overview", blocks: proseBlocks(value) }];

  const sections: DescriptionSection[] = [];
  const intro = normalText(value.slice(0, matches[0].index));
  if (intro) sections.push({ title: "Overview", blocks: proseBlocks(intro) });
  matches.forEach((match, index) => {
    const start = (match.index || 0) + match[0].length;
    const end = matches[index + 1]?.index ?? value.length;
    const body = normalText(value.slice(start, end).replace(/^[:\-]\s*/, ""));
    if (body) sections.push({ title: readableHeading(match[1]), blocks: proseBlocks(body) });
  });
  return sections;
}

export function sectionTone(titleText: string, blocks: DescriptionBlock[]) {
  const haystack = `${titleText} ${blocks.map(block => block.text).join(" ")}`.toLowerCase();
  if (haystack.includes("itar") || haystack.includes("u.s. citizen") || haystack.includes("clearance")) {
    return "restricted";
  }
  if (haystack.includes("require") || haystack.includes("qualification") || haystack.includes("must")) {
    return "requirements";
  }
  if (haystack.includes("responsibilities") || haystack.includes("what you") || haystack.includes("about this position")) {
    return "expect";
  }
  return "default";
}

export async function loadJobs(): Promise<JobsResponse> {
  const endpoints = [apiUrl("/api/jobs"), apiUrl("/data/jobs.json")];
  let lastError = "Could not load jobs";
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        lastError = `${endpoint} returned ${response.status}`;
        continue;
      }
      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(lastError);
}

export function countBy(jobs: Job[], field: keyof Job) {
  return jobs.reduce<Record<string, number>>((acc, job) => {
    const value = String(job[field] || "unknown");
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function matches(job: Job, filters: Filters) {
  const query = filters.q.trim().toLowerCase();
  if (query) {
    const haystack = [job.title, job.company, job.location, job.source, job.description]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (filters.location.trim() && !(job.location || "").toLowerCase().includes(filters.location.trim().toLowerCase())) return false;
  if (filters.company !== "all" && job.company !== filters.company) return false;
  return filterFields.every(field => filters[field] === "all" || job[field] === filters[field])
    && (filters.work_auth === "all" || job.work_auth === filters.work_auth);
}

export function applySavedView(view: string): Filters {
  return {
    ...defaultFilters,
    track: ["cs", "chemistry", "data_tpm"].includes(view) ? view : "all",
    role_type: ["intern", "new_grad"].includes(view) ? view : "all",
    work_auth: view === "us_citizen" ? "us_citizen" : "all",
  };
}

export function jobTags(job: Job) {
  return [
    job.track,
    job.role_type,
    job.work_auth && job.work_auth !== "unknown" ? job.work_auth : "",
    job.season && job.season !== "unknown" ? job.season : "",
    ...(job.tags || []),
  ].filter(Boolean) as string[];
}
