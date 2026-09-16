import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  tone = "neutral",
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
  tone?: "neutral" | "positive" | "loyalty";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-12 text-center", className)}>
      <div
        className={cn(
          "mb-4 flex size-14 items-center justify-center rounded-full",
          tone === "positive" && "bg-success-tint text-success",
          tone === "loyalty" && "bg-wheat-tint text-wheat-3",
          tone === "neutral" && "bg-paper-2 text-ink-3",
        )}
      >
        <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-[36ch] text-sm text-ink-2">{body}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
