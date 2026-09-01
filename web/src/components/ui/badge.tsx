import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[#9333EA] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#7C3AED]/20 text-[#A855F7] border-[#7C3AED]/40 hover:bg-[#7C3AED]/30",
        secondary:
          "bg-[#27272A] text-[#FAFAFA] border-[#3F3F46] hover:bg-[#3F3F46]",
        destructive:
          "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40 hover:bg-[#EF4444]/30",
        outline:
          "border-[#3F3F46] text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#FAFAFA]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
