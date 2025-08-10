import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:min-w-[350px] group-[.toaster]:max-w-[450px] group-[.toaster]:animate-in group-[.toaster]:slide-in-from-top-full group-[.toaster]:data-[swipe=move]:transition-none group-[.toaster]:data-[swipe=cancel]:transition-none group-[.toaster]:data-[swipe=end]:animate-out group-[.toaster]:data-[swipe=end]:slide-out-to-right-full group-[.toaster]:data-[state=open]:animate-in group-[.toaster]:data-[state=closed]:animate-out group-[.toaster]:data-[state=closed]:fade-out-80 group-[.toaster]:data-[state=closed]:slide-out-to-right-full group-[.toaster]:data-[state=open]:slide-in-from-top-full group-[.toaster]:data-[state=open]:sm:slide-in-from-bottom-full",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:bg-primary/90 group-[.toast]:focus:outline-none group-[.toast]:focus:ring-2 group-[.toast]:focus:ring-ring group-[.toast]:focus:ring-offset-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:bg-muted/90 group-[.toast]:focus:outline-none group-[.toast]:focus:ring-2 group-[.toast]:focus:ring-ring group-[.toast]:focus:ring-offset-2",
          success: "group-[.toast]:border-skyblue/20 group-[.toast]:bg-skyblue/5 group-[.toast]:text-skyblue",
          error: "group-[.toast]:border-red-200 group-[.toast]:bg-red-50 group-[.toast]:text-red-900",
          warning: "group-[.toast]:border-mustard/20 group-[.toast]:bg-mustard/5 group-[.toast]:text-mustard",
          info: "group-[.toast]:border-skyblue/20 group-[.toast]:bg-skyblue/5 group-[.toast]:text-skyblue",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
