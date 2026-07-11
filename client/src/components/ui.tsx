import React from "react";
import { cn } from "../lib/jobs";

// ── Pixel sun ────────────────────────────────────────────────────────────────
// Chunky 8-bit sun: gold body, coral rays. crispEdges keeps pixels hard at any size.
export function PixelSun({ size = 24 }: { size?: number }) {
  const body = "hsl(var(--sun))";
  const ray = "hsl(var(--coral))";
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="7" y="0" width="2" height="2" fill={ray} />
      <rect x="7" y="14" width="2" height="2" fill={ray} />
      <rect x="0" y="7" width="2" height="2" fill={ray} />
      <rect x="14" y="7" width="2" height="2" fill={ray} />
      <rect x="2" y="2" width="2" height="2" fill={ray} />
      <rect x="12" y="2" width="2" height="2" fill={ray} />
      <rect x="2" y="12" width="2" height="2" fill={ray} />
      <rect x="12" y="12" width="2" height="2" fill={ray} />
      <rect x="6" y="4" width="4" height="8" fill={body} />
      <rect x="4" y="6" width="8" height="4" fill={body} />
      <rect x="5" y="5" width="6" height="6" fill={body} />
    </svg>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
type Variant = "default" | "primary";

export function Button({
  variant = "default",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cn("db-btn h-10", variant === "primary" && "db-btn-primary", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "default",
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return (
    <a
      className={cn("db-btn h-10", variant === "primary" && "db-btn-primary", className)}
      {...props}
    />
  );
}

export function IconButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cn("db-btn h-10 w-10 shrink-0 px-0", className)} {...props} />;
}

// ── Badge ────────────────────────────────────────────────────────────────────
export type BadgeTone = "neutral" | "warm" | "strong" | "company";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-card text-ink",
  strong: "bg-sun text-ink",
  warm: "bg-coral text-white",
  company: "bg-sky text-white",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return <span className={cn("db-pill", badgeTones[tone])}>{children}</span>;
}
