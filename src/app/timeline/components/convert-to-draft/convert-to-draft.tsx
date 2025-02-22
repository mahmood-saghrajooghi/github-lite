import { ConvertToDraftEvent } from '@octokit/graphql-schema';
import { GitPullRequestDraftIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { User } from '@/components/user/user';

export function ConvertToDraft({ data }: { data: ConvertToDraftEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-zinc-800 text-zinc-300 outline outline-background outline-2"><GitPullRequestDraftIcon /></Icon>
      <span className="text-muted-foreground">
        <User actor={data.actor!} /> marked this pull request as a draft
      </span>
    </div>
  );
}
