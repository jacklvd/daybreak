import React from "react";
import {
  Buildings,
  FunnelSimple,
  GithubLogo,
  Globe,
  GraduationCap,
  MagnifyingGlass,
  MapPin,
  MoonStars,
  ShieldCheck,
  Stack,
  Sun,
} from "@phosphor-icons/react";

// TODO: point at the public repo once it's pushed (see the rename to "Daybreak").
const REPO_URL = "https://github.com/jacklvd/daybreak";
import {
  applySavedView,
  cn,
  defaultFilters,
  formatTimestamp,
  loadJobs,
  matches,
  savedViews,
  type Filters,
  type Job,
} from "./lib/jobs";
import { useTheme } from "./lib/theme";
import { Button, ButtonLink, IconButton, PixelSun } from "./components/ui";
import { FilterControl } from "./components/FilterControl";
import { JobCard } from "./components/JobCard";
import { JobDetail } from "./components/JobDetail";

type Status = "loading" | "ready" | "error";

function Header({
  jobCount,
  status,
  error,
  generatedAt,
  theme,
  onToggleTheme,
}: {
  jobCount: number;
  status: Status;
  error: string;
  generatedAt: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-3 md:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center border-2 border-ink bg-card shadow-brutal-sm">
            <PixelSun size={26} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold uppercase leading-none tracking-[0.18em] md:text-2xl">Daybreak</h1>
            <p className="mt-1.5 truncate text-xs text-muted md:text-sm">
              {status === "error"
                ? `Could not load data: ${error}`
                : `${jobCount} tracked roles · updated ${formatTimestamp(generatedAt)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light" : "Dark"}
          >
            {theme === "dark"
              ? <Sun size={18} weight="bold" aria-hidden="true" />
              : <MoonStars size={18} weight="bold" aria-hidden="true" />}
          </IconButton>
          <ButtonLink variant="primary" href={REPO_URL} target="_blank" rel="noreferrer">
            <GithubLogo size={17} weight="bold" aria-hidden="true" />
            Star
          </ButtonLink>
        </div>
      </div>
      {/* pixel sunrise stripe */}
      <div className="flex h-1.5" aria-hidden="true">
        <i className="flex-1 bg-coral" />
        <i className="flex-1 bg-peach" />
        <i className="flex-1 bg-sun" />
        <i className="flex-1 bg-sky" />
      </div>
    </header>
  );
}

function SearchBar({
  jobs,
  filters,
  onChange,
}: {
  jobs: Job[];
  filters: Filters;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}) {
  return (
    <section className="db-box overflow-hidden p-3 md:p-5" aria-label="Job search and filters">
      <div className="grid overflow-hidden border-2 border-ink bg-card md:grid-cols-2">
        <label className="flex h-16 min-w-0 items-center gap-3 px-5 text-coral md:border-r-2 md:border-ink">
          <MagnifyingGlass size={24} weight="bold" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-lg font-bold text-ink outline-none placeholder:font-normal placeholder:text-muted"
            value={filters.q}
            onChange={event => onChange("q", event.target.value)}
            type="search"
            name="job-title"
            autoComplete="off"
            placeholder="Job title or keyword…"
          />
        </label>
        <label className="flex h-16 min-w-0 items-center gap-3 border-t-2 border-ink px-5 text-coral md:border-t-0">
          <MapPin size={24} weight="bold" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-lg font-bold text-ink outline-none placeholder:font-normal placeholder:text-muted"
            value={filters.location}
            onChange={event => onChange("location", event.target.value)}
            type="search"
            name="location"
            autoComplete="off"
            placeholder="Location…"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2.5">
        <FilterControl label="Category" field="track" jobs={jobs} value={filters.track} onChange={value => onChange("track", value)} icon={<Stack size={20} weight="bold" />} />
        <FilterControl label="Level" field="role_type" jobs={jobs} value={filters.role_type} onChange={value => onChange("role_type", value)} icon={<GraduationCap size={20} weight="bold" />} />
        <FilterControl label="Company" field="company" jobs={jobs} value={filters.company} onChange={value => onChange("company", value)} icon={<Buildings size={19} weight="bold" />} />
        <FilterControl label="Work Auth" field="work_auth" jobs={jobs} value={filters.work_auth} onChange={value => onChange("work_auth", value)} icon={<Globe size={20} weight="bold" />} />
      </div>
    </section>
  );
}

export function App() {
  const { theme, toggle } = useTheme();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [generatedAt, setGeneratedAt] = React.useState("");
  const [filters, setFilters] = React.useState<Filters>(defaultFilters);
  const [activeView, setActiveView] = React.useState("all");
  const [status, setStatus] = React.useState<Status>("loading");
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
    <div className="min-h-screen text-ink">
      <Header
        jobCount={jobs.length}
        status={status}
        error={error}
        generatedAt={generatedAt}
        theme={theme}
        onToggleTheme={toggle}
      />

      <main className="mx-auto w-[min(1240px,calc(100vw-32px))] py-5 md:py-6">
        <SearchBar jobs={jobs} filters={filters} onChange={updateFilter} />

        <section className="my-5 flex flex-wrap items-center gap-2" aria-label="Saved views">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
            <FunnelSimple size={16} weight="bold" aria-hidden="true" />
            Views
          </div>
          {savedViews.map(view => (
            <Button
              key={view.id}
              className={cn(
                "h-9 px-3 text-xs",
                activeView === view.id && "db-btn-primary",
              )}
              onClick={() => setView(view.id)}
            >
              {view.label}
            </Button>
          ))}
        </section>

        <section className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-wide">Open Roles</h2>
            <p className="mt-1 max-w-full break-words text-xs text-muted">
              {filteredJobs.length} shown from {jobs.length} tracked roles · {internshipCount} internships · {newGradCount} new grad / entry
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-muted">
            <ShieldCheck size={16} weight="bold" aria-hidden="true" />
            {restrictedCount} roles with an explicit citizenship or clearance requirement
          </div>
        </section>

        {status === "loading" && <section className="db-box border-dashed p-10 text-center font-bold uppercase tracking-wide text-muted">Loading jobs…</section>}
        {status === "error" && <section className="db-box border-dashed p-10 text-center font-bold uppercase tracking-wide text-muted">Could not load jobs. Check the API URL or generated data file.</section>}
        {status === "ready" && filteredJobs.length === 0 && <section className="db-box border-dashed p-10 text-center font-bold uppercase tracking-wide text-muted">No jobs match these filters.</section>}
        {status === "ready" && filteredJobs.length > 0 && (
          <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]" aria-label="Job results">
            <div className="grid min-w-0 grid-cols-1 content-start gap-3 xl:max-h-[calc(100vh-124px)] xl:overflow-x-hidden xl:overflow-y-auto xl:pr-1">
              {filteredJobs.map(job => {
                const key = job.id || job.url;
                return (
                  <JobCard
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
