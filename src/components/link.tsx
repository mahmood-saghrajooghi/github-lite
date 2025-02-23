import { useRegisterHotkey } from '@/contexts/hotkey-context';
import { useNavigate } from "@tanstack/react-router";
import { createLink } from '@tanstack/react-router'
import type { LinkComponent } from '@tanstack/react-router';
import { forwardRef, useRef } from 'react';
import { composeRefs } from '@/lib/compose-refs';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  hotKey?: string
}

export const LinkImplementation = forwardRef<HTMLAnchorElement, LinkProps>(({
  hotKey,
  href,
  children,
  ...props
}, ref) => {
  const navigate = useNavigate()
  const internalRef = useRef<HTMLAnchorElement>(null)

  useRegisterHotkey(hotKey, () => {
    navigate({ to: href })
    internalRef.current?.focus()
  })

  return (
    <a
      href={href}
      ref={composeRefs(ref, internalRef)}
      {...props}
    >
      {children}
    </a>
  )
})

const CreatedLinkComponent = createLink(LinkImplementation)

export const Link: LinkComponent<typeof LinkImplementation> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />
}
