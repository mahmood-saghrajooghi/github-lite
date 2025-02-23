import { ReadyForReviewEvent } from '@/generated/graphql';
import { EyeIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { User } from '@/components/user/user';

export function ReadyForReview({ data }: { data: ReadyForReviewEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-accent text-muted-foreground"><EyeIcon /></Icon>
      <span className="text-muted-foreground">
        <User actor={data.actor!} /> marked this pull request as ready for review
      </span>
    </div>
  );
}
