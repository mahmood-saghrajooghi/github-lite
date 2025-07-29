import { LabeledEvent } from '@/generated/graphql';
import { TagIcon } from '@primer/octicons-react';
import { GithubLabel, Icon } from '@/app/components';
import { User } from '@/components/user/user';


export function Labeled({ data }: { data: LabeledEvent }) {
  return (
    <div className="flex gap-2">
      <Icon className="bg-accent text-muted-foreground"><TagIcon /></Icon>
      <span className="text-muted-foreground mt-1"><User actor={data.actor!} /> added the <GithubLabel color={data.label.color}>{data.label.name}</GithubLabel> label</span>
    </div>
  );
}
