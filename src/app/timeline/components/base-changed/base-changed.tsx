import { AutomaticBaseChangeSucceededEvent } from '@octokit/graphql-schema';
import { GitBranchIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { BranchName } from '@/app/components';


export function BaseChanged({ data }: { data: AutomaticBaseChangeSucceededEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-green-600 text-white"><GitBranchIcon /></Icon>
      <span className="text-muted-foreground">
        Base automatically changed from <BranchName>{data.oldBase}</BranchName> to <BranchName>{data.newBase}</BranchName>
      </span>
    </div>
  );
}
