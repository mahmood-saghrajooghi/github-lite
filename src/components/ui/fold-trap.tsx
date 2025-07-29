
import { Primitive } from '@radix-ui/react-primitive'
import { isHotkey } from 'is-hotkey'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type FoldTrapProps = React.ComponentPropsWithoutRef<typeof Primitive.div> & {
  toggleExpanded: () => void
}

const FoldTrap = forwardRef<React.ElementRef<typeof Primitive.div>, FoldTrapProps>(({ children, onKeyDown: onKeyDownProp, className, toggleExpanded, ...props }, ref) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isHotkey('f', event) && !event.shiftKey) {
      event.preventDefault();
      toggleExpanded();
    }
    onKeyDownProp?.(event);
  }

  return (
    <>
      <Primitive.div {...props} ref={ref} onKeyDown={handleKeyDown} className={cn(className, 'relative group')}>
        {children}
      </Primitive.div>
    </>
  )
})

FoldTrap.displayName = 'FoldTrap'

export { FoldTrap }
