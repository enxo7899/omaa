import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-control text-sm font-semibold whitespace-nowrap transition-[background-color,color,transform,box-shadow] duration-150 outline-none select-none active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-forest text-white hover:bg-forest-2",
        destructive: "bg-paprika text-white hover:bg-paprika-2 focus-visible:outline-paprika",
        outline: "border border-line-strong bg-white text-ink hover:bg-paper-2",
        secondary: "bg-paper-2 text-ink hover:bg-paper-3",
        ghost: "text-ink hover:bg-paper-2",
        link: "text-forest underline-offset-4 hover:underline",
        wheat: "bg-wheat-tint text-wheat-3 hover:bg-wheat-tint-2",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
