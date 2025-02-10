import { useRegisterHotkey } from '@/contexts/hotkey-context';
import { Link as TanStackLink, useNavigate } from "@tanstack/react-router";
import { forwardRef, useRef } from 'react';
import { composeRefs } from '@/hooks/compose-refs';

type LinkProps = React.ComponentProps<typeof TanStackLink> & {
  hotKey?: string
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(({
  children,
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
    <TanStackLink
      to={to}
      ref={composeRefs(ref, internalRef)}
      {...props}
    >
      {children}
    </TanStackLink>
  )
})
