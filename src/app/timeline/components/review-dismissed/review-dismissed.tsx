import { ReviewDismissedEvent } from '@octokit/graphql-schema';
import { XIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { Link } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { CommentBody } from '@/components/comment-card/comment-card';
import { CommitLink } from '../commit-link/commit-link';
import { User } from '@/components/user/user';

export function ReviewDismissed({ data }: { data: ReviewDismissedEvent }) {
  return (
    <div
      className="grid items-center gap-2"
      style={{
        gridTemplateAreas: `
          "icon description"
          ".    issue"
        `,
        gridTemplateColumns: 'min-content 1fr'
      }}>
      <Icon className="bg-accent text-muted-foreground"><XIcon /></Icon>
      <span><User actor={data.actor!} /> dismissed <Link to={data.review!.author!.url} target="_blank" className="font-semibold hover:underline">{data.review!.author!.login}</Link>'s stale review {data.pullRequestCommit && <>via <CommitLink commit={data.pullRequestCommit.commit} /></>}</span>
      {data.dismissalMessage && (
        <Card style={{ gridArea: 'issue' }}>
          <CommentBody>{data.dismissalMessage}</CommentBody>
        </Card>
      )}
    </div>
  );
}
