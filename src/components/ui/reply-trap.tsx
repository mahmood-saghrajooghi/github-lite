import { useIsFocused } from '@/hooks/use-is-focused'
import { Primitive } from '@radix-ui/react-primitive'
import { isHotkey } from 'is-hotkey'
import { forwardRef, useRef } from 'react'
import { Kbd } from './kbd'
import { cn } from '@/lib/utils'
import { composeRefs } from '@/lib/compose-refs'
import { createPortal } from 'react-dom'

type ReplyTrapProps = React.ComponentPropsWithoutRef<typeof Primitive.div>

const ReplyTrap = forwardRef<React.ElementRef<typeof Primitive.div>, ReplyTrapProps>(({ children, onKeyDown: onKeyDownProp, className, ...props }, ref) => {
  const replyTrapRef = useRef<HTMLDivElement>(null)
  const { isFocused, handleFocus, handleBlur } = useIsFocused();
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isHotkey('r', event)) {
      event.preventDefault();
      (event.target as HTMLElement).querySelector('textarea')?.focus();
    }
    onKeyDownProp?.(event);
  }

  return (
    <>
      <Primitive.div {...props} ref={composeRefs(ref, replyTrapRef)} onKeyDown={handleKeyDown} onFocus={handleFocus} onBlur={handleBlur} className={cn(className, 'relative group')}>
        {children}
      </Primitive.div>

      {isFocused && replyTrapRef.current && createPortal(
        <div className="items-center gap-1 text-xs text-muted-foreground absolute bottom-[calc(100%+.5rem)] right-0 z-10 hidden group-focus:flex">
          <Kbd className="text-[11px] min-w-[18px] w-auto px-[4px] h-[18px] rounded-sm">R</Kbd> reply
        </div>,
        replyTrapRef.current
      )}
    </>
  )
})

ReplyTrap.displayName = 'ReplyTrap'

export { ReplyTrap }
