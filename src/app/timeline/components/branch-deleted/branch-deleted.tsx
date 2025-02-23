import { HeadRefDeletedEvent } from '@/generated/graphql';
import { GitBranchIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { BranchName } from '@/app/components';
import { User } from '@/components/user/user';


export function BranchDeleted({ data }: { data: HeadRefDeletedEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-accent text-muted-foreground"><GitBranchIcon /></Icon>
      <span><User actor={data.actor!} /> deleted the <BranchName>{data.headRefName}</BranchName> branch</span>
    </div>
  );
}
