
import { Primitive } from '@radix-ui/react-primitive'
import { isHotkey } from 'is-hotkey'
import { forwardRef, useRef } from 'react'
import { cn } from '@/lib/utils'
import { composeRefs } from '@/lib/compose-refs'

type ReplyTrapProps = React.ComponentPropsWithoutRef<typeof Primitive.div> & {
  toggleExpanded: () => void
}

const ReplyTrap = forwardRef<React.ElementRef<typeof Primitive.div>, ReplyTrapProps>(({ children, onKeyDown: onKeyDownProp, className, toggleExpanded, ...props }, ref) => {
  const replyTrapRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isHotkey('r', event)) {
      event.preventDefault();
      (event.target as HTMLElement).querySelector('textarea')?.focus();
    }
    if (isHotkey('f', event) && !event.shiftKey) {
      event.preventDefault();
      toggleExpanded();
    }
    onKeyDownProp?.(event);
  }

  return (
    <>
      <Primitive.div {...props} ref={composeRefs(ref, replyTrapRef)} onKeyDown={handleKeyDown} className={cn(className, 'relative group')}>
        {children}
      </Primitive.div>
    </>
  )
})

ReplyTrap.displayName = 'ReplyTrap'

export { ReplyTrap }
