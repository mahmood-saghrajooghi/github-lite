import { CommentDeletedEvent } from '@/generated/graphql';
import { XIcon } from '@primer/octicons-react';
import { Link } from '@tanstack/react-router';
import { Icon } from '@/app/components';
import { User } from '@/components/user/user';


export function CommentDeleted({ data }: { data: CommentDeletedEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-accent text-muted-foreground"><XIcon /></Icon>
      <span className="text-muted-foreground">
        <User actor={data.actor!} /> deleted a comment from <Link to={data.deletedCommentAuthor!.url} target="_blank" className="hover:underline font-semibold text-foreground">{data.deletedCommentAuthor!.login}</Link>
      </span>
    </div>
  );
}

CommentDeleted.fragment = /* GraphQL */ `
fragment CommentDeletedEventFragment on CommentDeletedEvent {
  actor {
    ...ActorFragment
  }
  deletedCommentAuthor {
    login
    url
  }
}
`;
