import { Buildings, MapPin } from "@phosphor-icons/react";
import { cn, jobAge, jobTags, title, type Job } from "../lib/jobs";
import { Badge } from "./ui";

export function JobCard({
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
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col gap-3 border-2 border-ink p-4 text-left transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        selected
          ? "-translate-x-[1px] -translate-y-[1px] bg-peach/25 shadow-brutal-lg"
          : "bg-card shadow-brutal-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-brutal",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center border-2 border-ink bg-paper text-coral">
          <Buildings size={22} weight="bold" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-bold uppercase tracking-wide text-muted">{job.company}</div>
          <h3 className="mt-1 line-clamp-2 break-words text-sm font-extrabold leading-snug text-ink">{job.title}</h3>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
        <MapPin size={13} weight="bold" className="shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate" title={job.location || job.source}>{job.location || job.source}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} tone={index === 1 ? "strong" : "neutral"}>
              {title(tag)}
            </Badge>
          ))}
        </div>
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-muted">{jobAge(job.posted_at)}</span>
      </div>
    </button>
  );
}
