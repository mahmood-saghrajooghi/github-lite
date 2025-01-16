import { Link } from "@tanstack/react-router";
import clsx from "clsx";

export function TabLink({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={clsx(
        'flex items-center gap-1.5 h-7 px-2 rounded-md border border-transparent hover:border-input data-[status=active]:border-input shadow-sm text-muted-foreground hover:bg-accent/50 data-[status=active]:bg-accent/50 hover:text-accent-foreground data-[status=active]:text-foreground group duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
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
