import { UnlabeledEvent } from '@octokit/graphql-schema';
import { TagIcon } from '@primer/octicons-react';
import { GithubLabel, Icon } from '@/app/components';
import { User } from '@/components/user/user';

export function Unlabeled({ data }: { data: UnlabeledEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-accent text-muted-foreground"><TagIcon /></Icon>
      <span><User actor={data.actor!} /> removed the <GithubLabel color={data.label.color}>{data.label.name}</GithubLabel> label</span>
    </div>
  );
}
