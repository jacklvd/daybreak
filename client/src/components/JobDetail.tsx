import {
  ArrowUpRight,
  Buildings,
  CalendarBlank,
  ClockCounterClockwise,
  MapPin,
} from "@phosphor-icons/react";
import { cn, jobAge, jobTags, sectionTone, splitDescriptionSections, title, type Job } from "../lib/jobs";
import { Badge, ButtonLink } from "./ui";

function sectionAnchor(sectionTitle: string) {
  return `section-${sectionTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}

export function JobDetail({ job }: { job: Job }) {
  const tags = jobTags(job);
  const sections = splitDescriptionSections(job.description);
  const keySections = sections.filter(section => sectionTone(section.title, section.blocks) !== "default");

  return (
    <article className="db-pop min-w-0 overflow-x-hidden p-5 xl:sticky xl:top-[104px] xl:max-h-[calc(100vh-124px)] xl:overflow-y-auto md:p-7">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="company">
            <Buildings size={13} weight="bold" aria-hidden="true" />
            <span className="ml-1">{job.company}</span>
          </Badge>
          {job.work_auth === "us_citizen" && <Badge tone="warm">Required clearance signal</Badge>}
        </div>

        <h2 className="mt-3 max-w-4xl break-words text-xl font-extrabold leading-snug text-ink md:text-2xl">{job.title}</h2>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {job.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} weight="bold" aria-hidden="true" />
              {job.location}
            </span>
          )}
          {job.department && <span>{job.department}</span>}
          <span>{job.source}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {job.posted_at && (
            <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-2 py-1 font-bold uppercase tracking-wide text-muted">
              <CalendarBlank size={14} weight="bold" aria-hidden="true" />
              Posted {job.posted_at}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-sun px-2 py-1 font-bold uppercase tracking-wide text-ink">
            <ClockCounterClockwise size={14} weight="bold" aria-hidden="true" />
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

      <div className="mt-6 flex flex-wrap gap-2 border-t-2 border-ink pt-5">
        <ButtonLink variant="primary" className="h-11 px-4" href={job.url} target="_blank" rel="noreferrer">
          Apply on company site
          <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
        </ButtonLink>
        {/* Share / Flag are not wired up yet — re-enable once they have handlers.
        <IconButton className="h-11 w-11" aria-label="Share job" title="Share">
          <ShareNetwork size={19} weight="bold" aria-hidden="true" />
        </IconButton>
        <IconButton className="h-11 w-11" aria-label="Flag job" title="Flag">
          <Flag size={19} weight="bold" aria-hidden="true" />
        </IconButton>
        */}
      </div>

      {keySections.length > 0 && (
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Highlighted job sections">
          {keySections.slice(0, 4).map(section => {
            const tone = sectionTone(section.title, section.blocks);
            return (
              <a
                key={section.title}
                className={cn(
                  "db-pill",
                  tone === "restricted" && "bg-coral text-white",
                  tone === "requirements" && "bg-sun text-ink",
                  tone === "expect" && "bg-sky text-white",
                )}
                href={`#${sectionAnchor(section.title)}`}
              >
                {section.title}
              </a>
            );
          })}
        </nav>
      )}

      <div className="mt-7 grid gap-6 border-t-2 border-ink pt-7">
        {sections.map(section => {
          const tone = sectionTone(section.title, section.blocks);
          return (
            <section
              id={sectionAnchor(section.title)}
              key={`${section.title}-${section.blocks[0]?.text.slice(0, 20)}`}
              className={cn(
                "scroll-mt-5 border-l-4 pl-4",
                tone === "restricted" && "border-coral bg-coral/10 py-3 pr-4",
                tone === "requirements" && "border-sun bg-sun/10 py-3 pr-4",
                tone === "expect" && "border-sky bg-sky/10 py-3 pr-4",
                tone === "default" && "border-ink/25",
              )}
            >
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink">{section.title}</h3>
              <div className="mt-3 grid gap-3 text-[15px] leading-7 text-ink/80">
                {section.blocks.map((block, index) => block.kind === "bullet" ? (
                  <div className="flex gap-3" key={`${block.text.slice(0, 20)}-${index}`}>
                    <span className="mt-2.5 h-2 w-2 shrink-0 bg-coral" />
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
