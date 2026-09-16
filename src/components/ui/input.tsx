import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-control border border-line-strong bg-white px-3 text-base text-ink transition-[border-color,box-shadow] outline-none placeholder:text-ink-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
        "aria-invalid:border-paprika",
        className
      )}
      {...props}
    />
  )
}

export { Input }
