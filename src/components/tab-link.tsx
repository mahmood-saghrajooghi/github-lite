import { useRegisterHotkey } from '@/contexts/hotkey-context';
import { createLink, useNavigate } from "@tanstack/react-router";
import type { LinkComponent } from "@tanstack/react-router";
import clsx from "clsx";
import { forwardRef, useRef } from 'react';
import { composeRefs } from '@/lib/compose-refs';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  hotKey?: string
  href: string
}

export const LinkImplementation = forwardRef<HTMLAnchorElement, LinkProps>(({
  hotKey,
  href,
  className,
  children,
  ...props
}, ref) => {
  const navigate = useNavigate()
  const internalRef = useRef<HTMLAnchorElement>(null)

  useRegisterHotkey(hotKey, () => {
    navigate({ to: href })
    internalRef.current?.focus()
  }, [href])

  return (
    <a
      href={href}
      ref={composeRefs(ref, internalRef)}
      className={clsx(
        'flex items-center gap-1.5 h-7 px-2 rounded-md border border-transparent hover:border-input data-[status=active]:border-input shadow-sm text-muted-foreground hover:bg-accent/50 data-[status=active]:bg-accent/50 hover:text-accent-foreground data-[status=active]:text-foreground group duration-200 outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
})

const CreatedLinkComponent = createLink(LinkImplementation)

export const TabLink: LinkComponent<typeof LinkImplementation> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />
}

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
