import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 active:scale-95",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-lg transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-300",
        gradient: "bg-gradient-to-r from-skyblue to-mustard text-white hover:from-skyblue/90 hover:to-mustard/90 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        success: "bg-gradient-to-r from-skyblue to-skyblue/80 text-white hover:from-skyblue/90 hover:to-skyblue/70 shadow-lg hover:shadow-xl transform hover:scale-105",
        warning: "bg-gradient-to-r from-mustard to-mustard/80 text-white hover:from-mustard/90 hover:to-mustard/70 shadow-lg hover:shadow-xl transform hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
