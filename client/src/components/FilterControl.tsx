import React from "react";
import { CaretDown } from "@phosphor-icons/react";
import { countBy, title, type Job } from "../lib/jobs";

export function FilterControl({
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

  // max-w caps the box: an inline-flex label sizes to its select's max-content,
  // which is the longest <option> — long company names would otherwise blow the
  // box up and wrap the row. The select (min-w-0 flex-1) truncates inside it.
  return (
    <label className="db-box relative inline-flex h-12 min-w-[164px] max-w-[232px] items-center text-ink transition-transform duration-100 focus-within:-translate-y-[2px] focus-within:shadow-brutal">
      <span className="ml-3 shrink-0 text-coral">{icon}</span>
      <select
        aria-label={label}
        className="h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent px-2 pr-8 text-sm font-bold uppercase tracking-wide outline-none"
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        <option value="all">{label}</option>
        {options.map(([option, count]) => (
          <option key={option} value={option}>
            {title(option)} ({count})
          </option>
        ))}
      </select>
      <CaretDown className="pointer-events-none absolute right-3" size={16} weight="bold" aria-hidden="true" />
    </label>
  );
}
