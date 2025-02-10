import { useRegisterHotkey } from '@/contexts/hotkey-context';
import { Link, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { forwardRef, useRef } from 'react';
import { composeRefs } from '@/hooks/compose-refs';

type TabLinkProps = React.ComponentProps<typeof Link> & {
  hotKey?: string
}

export const TabLink = forwardRef<HTMLAnchorElement, TabLinkProps>(({
  children,
  className,
  hotKey,
  to,
  ...props
}, ref) => {
  const navigate = useNavigate()
  const internalRef = useRef<HTMLAnchorElement>(null)

  useRegisterHotkey(hotKey, () => {
    navigate({ to })
    internalRef.current?.focus()
  })

  return (
    <Link
      className={clsx(
        'flex items-center gap-1.5 h-7 px-2 rounded-md border border-transparent hover:border-input data-[status=active]:border-input shadow-sm text-muted-foreground hover:bg-accent/50 data-[status=active]:bg-accent/50 hover:text-accent-foreground data-[status=active]:text-foreground group duration-200 outline-none',
        className,
      )}
      to={to}
      ref={composeRefs(ref, internalRef)}
      {...props}
    >
      {children}
    </Link>
  )
})

export function TabLinkIcon({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'text-muted-foreground !group-data-[status=active]:text-muted-foreground group-hover:text-foreground duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
