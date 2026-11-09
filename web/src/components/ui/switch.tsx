"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

/** An on/off setting. Wrap it in a <label> with the setting's name. */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "focus-ring inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted transition-colors data-checked:border-primary data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-background shadow-popover transition-transform data-checked:translate-x-[1.0625rem]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
