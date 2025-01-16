import { Primitive } from '@radix-ui/react-primitive'
import clsx from 'clsx'

type Props = React.ComponentProps<typeof Primitive.div>

export function AppHeader({ children, className, ...props }: Props) {
  return (
    <Primitive.div className={clsx("flex h-12 shrink-0 items-center gap-4 border-b px-4 text-xs", className)} {...props}>
      {children}
    </Primitive.div>
  )
}
