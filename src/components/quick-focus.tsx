import { isFormField } from '@/contexts/hotkey-utils';
import { isHotkey } from "is-hotkey";
import { Primitive } from '@radix-ui/react-primitive';
import { forwardRef, useRef } from 'react';
import { composeRefs } from '@/lib/compose-refs';
import { cn } from '@/lib/utils';

type QuickFocusProps = React.ComponentPropsWithoutRef<typeof Primitive.div>

export const QuickFocus = forwardRef<React.ElementRef<typeof Primitive.div>, QuickFocusProps>(({ children, onKeyDown: onKeyDownProp, className, ...props }, ref) => {
  const internalRef = useRef<HTMLDivElement>(null)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isFormField(event.target as Node)) {
      return;
    }

    const elements = document.querySelectorAll('[data-quick-focus]')
    const index = Array.from(elements).indexOf(event.target as HTMLElement)

    if (isHotkey(['j', 'arrowDown'], event)) {
      event.preventDefault();
      // next element that has data-quick-focus after the current
      if (index < elements.length ) {
        (elements[index + 1] as HTMLElement).focus();
        (elements[index + 1] as HTMLElement).scrollIntoView();
      }
    }

    if (isHotkey(['k', 'arrowUp'], event)) {
      event.preventDefault();
      // previous element that has data-quick-focus before the current
      if (index > 0) {
        (elements[index - 1] as HTMLElement).focus();
        (elements[index - 1] as HTMLElement).scrollIntoView();
      }
    }

    onKeyDownProp?.(event);
  }

  return (
    <Primitive.div
      {...props}
      ref={composeRefs(ref, internalRef)}
      data-quick-focus
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={cn("focus:outline focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 rounded-xl", className)}
    >
      {children}
    </Primitive.div>
  )
})

QuickFocus.displayName = 'QuickFocus'
