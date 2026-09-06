import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";
import { controlStyles } from "./control-styles";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        controlStyles,
        "h-control w-full min-w-0 px-3 py-2 file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}
export { Input };
