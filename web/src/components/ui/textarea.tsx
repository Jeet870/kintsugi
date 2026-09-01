import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[90px] w-full rounded-xl border border-[#3F3F46] bg-[#27272A] px-3.5 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#71717A] shadow-sm transition-all duration-200 outline-none focus-visible:border-[#7C3AED] focus-visible:ring-2 focus-visible:ring-[#9333EA] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
