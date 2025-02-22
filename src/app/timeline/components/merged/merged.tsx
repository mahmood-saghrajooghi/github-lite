
import { MergedEvent } from '@octokit/graphql-schema';
import { GitMergeIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { User } from '@/components/user/user';
import { CommitLink } from '../commit-link/commit-link';
import { BranchName } from '@/app/components';

export function Merged({ data }: { data: MergedEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-purple-600 text-white"><GitMergeIcon /></Icon>
      <span><User actor={data.actor!} /> merged commit <CommitLink commit={data.commit!} /> into <BranchName>{data.mergeRefName}</BranchName></span>
    </div>
  );
}
