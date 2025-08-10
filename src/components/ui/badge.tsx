import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-skyblue/10 text-skyblue hover:bg-skyblue/20",
        warning: "border-transparent bg-mustard/10 text-mustard hover:bg-mustard/20",
        info: "border-transparent bg-skyblue/10 text-skyblue hover:bg-skyblue/20",
        skyblue: "border-transparent bg-skyblue/10 text-skyblue hover:bg-skyblue/20",
        mustard: "border-transparent bg-mustard/10 text-mustard hover:bg-mustard/20",
        mixed: "border-transparent bg-gradient-to-r from-skyblue/10 to-mustard/10 text-skyblue hover:from-skyblue/20 hover:to-mustard/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
