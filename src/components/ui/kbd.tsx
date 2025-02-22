import { useHotkey } from '@/contexts/hotkey-context';
import { useIsPressing } from '@/hooks/use-is-pressing';
import { cn } from '@/lib/utils';
import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { MutableRefObject } from 'react';


type KbdContextType = {
  registerKbd: (kbdKey: string) => void
  kbdIndexMap: MutableRefObject<Record<string, number>>
}

const KbdContext = createContext<KbdContextType | null>(null)

export function KbdGroup({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const kbdIndexMap = useRef<Record<string, number>>({})

  const index = useRef(0)

  const registerKbd = useCallback((kbdKey: string) => {
    if (kbdIndexMap.current[kbdKey] === undefined) {
      kbdIndexMap.current = { ...kbdIndexMap.current, [kbdKey]: index.current };
      index.current++
    }
  }, [])

  return (
    <KbdContext.Provider value={{ registerKbd, kbdIndexMap }}>
      <div className={cn("flex items-center gap-1", className)} {...props}>
        {children}
      </div>
    </KbdContext.Provider>
  )
}

type KbdProps = React.HTMLAttributes<HTMLElement> & {
  children: string;
  className?: string
}

export function Kbd({ children, className, ...props }: KbdProps) {
  const kbdContext = useContext(KbdContext)
  const { sequenceTrackerState } = useHotkey();


  const isPressing = useIsPressing(children);

  let keyActive = false;
  if (kbdContext) {
    const { kbdIndexMap } = kbdContext
    const index = kbdIndexMap.current[children]
    keyActive = sequenceTrackerState[index] === children;
  }

  useEffect(() => {
    if (kbdContext) {
      const { registerKbd } = kbdContext
      registerKbd(children)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <kbd className={cn(
      "w-5 h-5 text-xs flex shrink-0 items-center justify-center bg-accent border border-accent rounded-md text-muted-foreground duration-200",
      keyActive || isPressing ? "text-accent-foreground bg-secondary border border-accent" : "",
      className
    )} {...props}>
      {children}
    </kbd>
  )
}
