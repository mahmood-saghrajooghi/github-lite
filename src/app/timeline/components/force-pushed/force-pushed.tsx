import { HeadRefForcePushedEvent } from '@/generated/graphql';
import { RepoPushIcon } from '@primer/octicons-react';
import { Icon, BranchName } from '@/app/components';
import { User } from '@/components/user/user';
import { CommitLink } from '../commit-link/commit-link';


export function ForcePushed({ data }: { data: HeadRefForcePushedEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-accent text-muted-foreground"><RepoPushIcon /></Icon>
      <span className="text-muted-foreground">
        <User actor={data.actor!} /> force-pushed the {data.ref && <BranchName>{data.ref.name}</BranchName>} branch from <CommitLink commit={data.beforeCommit!} /> to <CommitLink commit={data.afterCommit!} />
      </span>
    </div>
  );
}
