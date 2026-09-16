"use client"

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      offset={{ top: 16 }}
      mobileOffset={{ top: 72 }}
      toastOptions={{
        classNames: {
          toast: "!rounded-card !border-line !bg-white !text-ink !shadow-float !font-sans !text-sm",
          description: "!text-ink-2",
          success: "[&_svg]:!text-success",
          error: "[&_svg]:!text-paprika",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
