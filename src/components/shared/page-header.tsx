import { cn } from "cn";

export function PageHeader({
  title,
  subtitle,
  action,
  className,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-xs font-medium text-ink-3">{eyebrow}</div>}
        <h1 className="text-xl font-bold tracking-[-0.01em] text-ink lg:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-[60ch] text-sm text-ink-2">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {body && <p className="mt-0.5 text-xs text-ink-3">{body}</p>}
      </div>
      {action}
    </div>
  );
}
