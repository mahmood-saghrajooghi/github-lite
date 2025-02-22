import { ReviewRequestedEvent } from '@octokit/graphql-schema';
import { EyeIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { User } from '@/components/user/user';
import { Link } from '@tanstack/react-router';

export function ReviewRequested({ data }: { data: ReviewRequestedEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-accent text-muted-foreground"><EyeIcon /></Icon>
      <span className="text-muted-foreground">
        <User actor={data.actor!} /> requested a review{'login' in data.requestedReviewer! && <> from <Link to={data.requestedReviewer!.url} target="_blank" className="hover:underline font-semibold text-foreground">{data.requestedReviewer!.login}</Link></>}</span>
    </div>
  );
}
