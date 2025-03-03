import { ActorFragmentFragment } from '@/generated/graphql';
import { Link } from '@tanstack/react-router';
import { Avatar } from '@/app/components';


export function User({ actor }: { actor: ActorFragmentFragment }) {
  return (
    <span className="inline-flex items-center align-bottom text-muted-foreground">
      <Avatar src={actor.avatarUrl} className="inline mr-2" />
      <Link href={actor.url} target="_blank" className="font-semibold hover:underline text-foreground">{actor.login}</Link>
    </span>
  )
}
