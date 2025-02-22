import * as React from "react"
import { isHotkey } from "is-hotkey"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isHotkey('escape', event)) {
      (event.target as HTMLTextAreaElement).blur();
      const quickFocus = (event.target as HTMLElement).closest('[data-quick-focus]');
      if (quickFocus) {
        (quickFocus as HTMLElement).focus();
      }
    }
    onKeyDown?.(event);
  }

  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
      onKeyDown={handleKeyDown}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
