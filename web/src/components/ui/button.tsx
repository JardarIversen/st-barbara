import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring group/button inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent bg-clip-padding font-sans text-sm font-medium leading-5 whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border-border bg-background text-primary hover:border-primary hover:bg-accent aria-expanded:border-primary aria-expanded:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-control gap-2 px-5",
        xs: "h-control-xs gap-1 px-2 text-xs",
        sm: "h-control-sm gap-2 px-4",
        lg: "h-control-lg gap-2 px-6",
        icon: "size-control [&_svg:not([class*='size-'])]:size-6",
        "icon-xs": "size-control-xs",
        "icon-sm": "size-control-sm [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "size-control-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
