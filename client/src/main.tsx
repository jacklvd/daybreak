import React from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Briefcase,
  Buildings,
  CalendarBlank,
  CaretDown,
  ClockCounterClockwise,
  DownloadSimple,
  Flag,
  FunnelSimple,
  Globe,
  GraduationCap,
  MagnifyingGlass,
  MapPin,
  ShareNetwork,
  ShieldCheck,
  Stack,
} from "@phosphor-icons/react";
import "./styles.css";

type Job = {
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

type JobsResponse = {
  generated_at: string;
  count: number;
  total?: number;
  jobs: Job[];
};

type Filters = {
  q: string;
  location: string;
  track: string;
  role_type: string;
  season: string;
  source: string;
  company: string;
  work_auth: string;
};

const labels: Record<string, string> = {
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

const filterFields: Array<keyof Pick<Filters, "track" | "role_type" | "season" | "source">> = [
  "track",
  "role_type",
  "season",
  "source",
];

const savedViews = [
  { id: "all", label: "All" },
  { id: "cs", label: "CS" },
  { id: "chemistry", label: "Chemistry" },
  { id: "data_tpm", label: "Data + TPM" },
  { id: "intern", label: "Intern" },
  { id: "new_grad", label: "New Grad" },
  { id: "us_citizen", label: "Citizen / Clearance" },
];

const defaultFilters: Filters = {
  q: "",
  location: "",
  track: "all",
  role_type: "all",
  season: "all",
  source: "all",
  company: "all",
  work_auth: "all",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function title(value?: string) {
  if (!value) return "";
  return labels[value] || value.replace(/_/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
}

function apiUrl(path: string) {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
  return `${base}${path}`;
}

function formatTimestamp(value?: string) {
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

function jobAge(value?: string) {
  const posted = parsePostedDate(value);
  if (!posted) return "Age unknown";
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.max(0, Math.floor((todayStart.getTime() - posted.getTime()) / 86_400_000));
  if (days === 0) return "Posted today";
  if (days === 1) return "1 day live";
  return `${days} days live`;
}

type DescriptionBlock = { kind: "paragraph" | "bullet"; text: string };
type DescriptionSection = { title: string; blocks: DescriptionBlock[] };

function normalText(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+([.,;:])/g, "$1").trim();
}

function parseDescriptionDocument(value?: string) {
  let markup = value || "";
  for (let pass = 0; pass < 2; pass += 1) {
    const doc = new DOMParser().parseFromString(markup, "text/html");
    const decoded = doc.body.textContent || "";
    if (!doc.body.children.length && /<\/?[a-z][^>]*>/i.test(decoded)) {
      markup = decoded;
      continue;
    }
    return doc;
  }
  return new DOMParser().parseFromString(markup, "text/html");
}

function isSectionHeading(value: string) {
  const compact = normalText(value).replace(/:$/, "");
  if (!compact || compact.length > 90) return false;
  return /^(about|who we are|the role|what you('|’)ll|what we|responsibilit|qualifications?|requirements?|skills|benefits|compensation|additional|itar|equal opportunity|preferred|minimum|basic)/i.test(compact)
    || (compact === compact.toUpperCase() && /[A-Z]/.test(compact));
}

function splitDescriptionSections(value?: string): DescriptionSection[] {
  const source = normalText(value || "");
  if (!/<\/?[a-z][^>]*>/i.test(source)) return splitPlainTextSections(source);
  const doc = parseDescriptionDocument(value);
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

function sectionTone(titleText: string, blocks: DescriptionBlock[]) {
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

async function loadJobs(): Promise<JobsResponse> {
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

function countBy(jobs: Job[], field: keyof Job) {
  return jobs.reduce<Record<string, number>>((acc, job) => {
    const value = String(job[field] || "unknown");
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function matches(job: Job, filters: Filters) {
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

function applySavedView(view: string): Filters {
  return {
    ...defaultFilters,
    track: ["cs", "chemistry", "data_tpm"].includes(view) ? view : "all",
    role_type: ["intern", "new_grad"].includes(view) ? view : "all",
    work_auth: view === "us_citizen" ? "us_citizen" : "all",
  };
}

function FilterControl({
  label,
  field,
  jobs,
  value,
  onChange,
  icon,
}: {
  label: string;
  field: keyof Job;
  jobs: Job[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}) {
  const options = Object.entries(countBy(jobs, field))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <label className="relative inline-flex h-12 min-w-[154px] items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
      <span className="ml-4 shrink-0 text-slate-500">{icon}</span>
      <select
        aria-label={label}
        className="h-full min-w-0 flex-1 appearance-none bg-transparent px-2 pr-8 text-base font-medium outline-none"
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        <option value="all">{label}</option>
        {options.map(([option, count]) => (
          <option key={option} value={option}>
            {title(option)}
          </option>
        ))}
      </select>
      <CaretDown className="pointer-events-none absolute right-3" size={16} weight="bold" aria-hidden="true" />
    </label>
  );
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warm" | "strong" | "company";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2 py-0.5 text-xs font-bold",
        tone === "neutral" && "border-transparent bg-accent text-accent-foreground",
        tone === "strong" && "border-transparent bg-secondary text-secondary-foreground",
        tone === "warm" && "border-amber-200 bg-warning text-warning-foreground",
        tone === "company" && "border-primary/20 bg-primary/10 text-primary",
      )}
    >
      {children}
    </span>
  );
}

function jobTags(job: Job) {
  return [
    job.track,
    job.role_type,
    job.work_auth && job.work_auth !== "unknown" ? job.work_auth : "",
    job.season && job.season !== "unknown" ? job.season : "",
    ...(job.tags || []),
  ].filter(Boolean);
}

function JobListItem({
  job,
  selected,
  onSelect,
}: {
  job: Job;
  selected: boolean;
  onSelect: () => void;
}) {
  const tags = jobTags(job).slice(0, 3);

  return (
    <button
      className={cn(
        "w-full overflow-hidden rounded-lg border bg-card p-4 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/25"
          : "border-border hover:border-primary/30 hover:bg-muted/40",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-white text-primary">
          <Buildings size={22} weight="duotone" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-muted-foreground">{job.company}</div>
          <h3 className="mt-1 line-clamp-2 break-words font-extrabold leading-snug text-foreground">{job.title}</h3>
          <div className="mt-2 truncate text-sm text-muted-foreground" title={job.location || job.source}>{job.location || job.source}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} tone={index === 1 ? "strong" : "neutral"}>
              {title(tag)}
            </Badge>
          ))}
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">{jobAge(job.posted_at)}</span>
      </div>
    </button>
  );
}

function JobDetail({ job }: { job: Job }) {
  const tags = [
    job.track,
    job.role_type,
    job.work_auth && job.work_auth !== "unknown" ? job.work_auth : "",
    job.season && job.season !== "unknown" ? job.season : "",
    ...(job.tags || []),
  ].filter(Boolean);
  const sections = splitDescriptionSections(job.description);
  const keySections = sections.filter(section => sectionTone(section.title, section.blocks) !== "default");

  return (
    <article className="min-w-0 overflow-x-hidden rounded-lg border border-slate-200 bg-card p-5 shadow-soft xl:sticky xl:top-[92px] xl:max-h-[calc(100vh-112px)] xl:overflow-y-auto md:p-7">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="company">
            <Buildings size={14} weight="bold" aria-hidden="true" />
            <span className="ml-1">{job.company}</span>
          </Badge>
          {job.work_auth === "us_citizen" && <Badge tone="warm">Required clearance signal</Badge>}
        </div>

        <h2 className="mt-3 max-w-4xl text-xl font-extrabold leading-snug text-slate-900 md:text-2xl">{job.title}</h2>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {job.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} aria-hidden="true" />
              {job.location}
            </span>
          )}
          {job.department && <span>{job.department}</span>}
          <span>{job.source}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {job.posted_at && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-muted-foreground">
              <CalendarBlank size={15} aria-hidden="true" />
              Posted {job.posted_at}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 font-semibold text-foreground">
            <ClockCounterClockwise size={15} aria-hidden="true" />
            {jobAge(job.posted_at)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} tone={index === 1 ? "strong" : "neutral"}>
              {title(tag)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
        <a
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 font-extrabold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          href={job.url}
          target="_blank"
          rel="noreferrer"
        >
          Apply on company site
          <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
        </a>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-white text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" type="button" aria-label="Share job" title="Share">
          <ShareNetwork size={19} weight="bold" aria-hidden="true" />
        </button>
        <button className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-white text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" type="button" aria-label="Flag job" title="Flag">
          <Flag size={19} weight="bold" aria-hidden="true" />
        </button>
      </div>

      {keySections.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Highlighted job sections">
          {keySections.slice(0, 4).map(section => {
            const tone = sectionTone(section.title, section.blocks);
            return (
              <a
                key={section.title}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-bold transition",
                  tone === "restricted" && "bg-warning text-warning-foreground",
                  tone === "requirements" && "bg-primary/10 text-primary",
                  tone === "expect" && "bg-secondary text-secondary-foreground",
                )}
                href={`#section-${section.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
              >
                {section.title}
              </a>
            );
          })}
        </nav>
      )}

      <div className="mt-7 grid gap-7 border-t border-slate-100 pt-7">
        {sections.map(section => {
          const tone = sectionTone(section.title, section.blocks);
          return (
            <section
              id={`section-${section.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
              key={`${section.title}-${section.blocks[0]?.text.slice(0, 20)}`}
              className={cn(
                "scroll-mt-5 border-l-4 pl-4",
                tone === "restricted" && "border-amber-400 bg-amber-50/70 py-3 pr-4",
                tone === "requirements" && "border-primary bg-primary/[0.035] py-3 pr-4",
                tone === "expect" && "border-blue-400 bg-blue-50/60 py-3 pr-4",
                tone === "default" && "border-transparent",
              )}
            >
              <h3 className="text-base font-extrabold text-slate-900">{section.title}</h3>
              <div className="mt-3 grid gap-3 text-[16px] leading-7 text-slate-700">
                {section.blocks.map((block, index) => block.kind === "bullet" ? (
                  <div className="flex gap-3" key={`${block.text.slice(0, 20)}-${index}`}>
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                    <p>{block.text}</p>
                  </div>
                ) : <p key={`${block.text.slice(0, 20)}-${index}`}>{block.text}</p>)}
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
}

function App() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [generatedAt, setGeneratedAt] = React.useState("");
  const [filters, setFilters] = React.useState<Filters>(defaultFilters);
  const [activeView, setActiveView] = React.useState("all");
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    loadJobs()
      .then(data => {
        setJobs(data.jobs || []);
        setGeneratedAt(data.generated_at || "");
        setStatus("ready");
      })
      .catch((loadError: Error) => {
        setError(loadError.message);
        setStatus("error");
      });
  }, []);

  const filteredJobs = React.useMemo(() => jobs.filter(job => matches(job, filters)), [jobs, filters]);
  const [selectedJobId, setSelectedJobId] = React.useState("");
  const selectedJob = React.useMemo(
    () => filteredJobs.find(job => (job.id || job.url) === selectedJobId) || filteredJobs[0],
    [filteredJobs, selectedJobId],
  );

  React.useEffect(() => {
    if (filteredJobs.length && !filteredJobs.some(job => (job.id || job.url) === selectedJobId)) {
      setSelectedJobId(filteredJobs[0].id || filteredJobs[0].url);
    }
  }, [filteredJobs, selectedJobId]);
  const internshipCount = jobs.filter(job => job.role_type === "intern").length;
  const newGradCount = jobs.filter(job => job.role_type === "new_grad" || job.role_type === "entry").length;
  const restrictedCount = jobs.filter(job => job.work_auth === "us_citizen").length;

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setActiveView("custom");
    setFilters(current => ({ ...current, [key]: value }));
  }

  function setView(view: string) {
    setActiveView(view);
    setFilters(applySavedView(view));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/90 bg-white/95 px-4 py-4 backdrop-blur md:px-7">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Briefcase size={23} weight="duotone" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold leading-tight md:text-2xl">Daily Job Digest</h1>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {status === "error"
                  ? `Could not load data: ${error}`
                  : `${jobs.length} tracked roles · updated ${formatTimestamp(generatedAt)}`}
              </p>
            </div>
          </div>
          <a
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 font-bold text-primary transition hover:bg-primary/10"
            href={apiUrl("/data/jobs.csv")}
          >
            <DownloadSimple size={17} weight="bold" aria-hidden="true" />
            CSV
          </a>
        </div>
      </header>

      <main className="mx-auto w-[min(1240px,calc(100vw-32px))] py-5 md:py-6">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-4 shadow-sm md:px-6 md:py-5" aria-label="Job search and filters">
          <div className="grid overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm md:grid-cols-2">
            <label className="flex h-16 min-w-0 items-center gap-3 px-5 text-slate-500 md:border-r md:border-slate-200">
              <MagnifyingGlass size={25} weight="regular" aria-hidden="true" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-xl text-slate-900 outline-none placeholder:text-slate-500"
                value={filters.q}
                onChange={event => updateFilter("q", event.target.value)}
                type="search"
                name="job-title"
                autoComplete="off"
                placeholder="Job title or keyword…"
              />
            </label>
            <label className="flex h-16 min-w-0 items-center gap-3 border-t border-slate-200 px-5 text-slate-500 md:border-t-0">
              <MapPin size={25} weight="regular" aria-hidden="true" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-xl text-slate-900 outline-none placeholder:text-slate-500"
                value={filters.location}
                onChange={event => updateFilter("location", event.target.value)}
                type="search"
                name="location"
                autoComplete="off"
                placeholder="Location…"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <FilterControl label="Category" field="track" jobs={jobs} value={filters.track} onChange={value => updateFilter("track", value)} icon={<Stack size={22} weight="regular" />} />
            <FilterControl label="Level" field="role_type" jobs={jobs} value={filters.role_type} onChange={value => updateFilter("role_type", value)} icon={<GraduationCap size={22} weight="regular" />} />
            <FilterControl label="Company" field="company" jobs={jobs} value={filters.company} onChange={value => updateFilter("company", value)} icon={<Buildings size={21} weight="regular" />} />
            <FilterControl label="Eligibility" field="work_auth" jobs={jobs} value={filters.work_auth} onChange={value => updateFilter("work_auth", value)} icon={<Globe size={22} weight="regular" />} />
          </div>
        </section>

        <section className="my-5 flex flex-wrap items-center gap-2" aria-label="Saved views">
          <div className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
            <FunnelSimple size={16} weight="bold" aria-hidden="true" />
            Views
          </div>
          {savedViews.map(view => (
            <button
              key={view.id}
              className={cn(
                "h-9 rounded-md border px-3 text-sm font-bold transition",
                activeView === view.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
              onClick={() => setView(view.id)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </section>

        <section className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Open Roles</h2>
            <p className="mt-1 max-w-full break-words text-sm text-muted-foreground">{filteredJobs.length} shown from {jobs.length} tracked roles · {internshipCount} internships · {newGradCount} new grad / entry</p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
            <ShieldCheck size={17} weight="bold" aria-hidden="true" />
            {restrictedCount} roles with an explicit citizenship or clearance requirement
          </div>
        </section>

        {status === "loading" && <section className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">Loading jobs...</section>}
        {status === "error" && <section className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">Could not load jobs. Check the API URL or generated data file.</section>}
        {status === "ready" && filteredJobs.length === 0 && <section className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">No jobs match these filters.</section>}
        {status === "ready" && filteredJobs.length > 0 && (
          <section className="grid min-w-0 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]" aria-label="Job results">
            <div className="grid min-w-0 gap-3 xl:max-h-[calc(100vh-112px)] xl:overflow-x-hidden xl:overflow-y-auto xl:pr-1">
              {filteredJobs.map(job => {
                const key = job.id || job.url;
                return (
                  <JobListItem
                    key={key}
                    job={job}
                    selected={(selectedJob?.id || selectedJob?.url) === key}
                    onSelect={() => setSelectedJobId(key)}
                  />
                );
              })}
            </div>
            {selectedJob && <JobDetail job={selectedJob} />}
          </section>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
