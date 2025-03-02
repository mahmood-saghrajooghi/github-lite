import { CommittedEventFragmentFragment } from '@/generated/graphql';
import { GitCommitIcon } from '@primer/octicons-react';
import { Link } from '@tanstack/react-router';
import { CommitLink } from '../commit-link/commit-link';
import { Icon, Avatar, Status } from '@/app/components';

export function Committed({ data }: { data: CommittedEventFragmentFragment }) {
  return (
    <div className="flex gap-2 items-center">
      <Icon className="text-zinc-300 bg-background h-5"><GitCommitIcon /></Icon>
      <Avatar src={data.commitedCommit.author!.avatarUrl} />
      <span className="flex-1 line-clamp-2"><Link to={data.commitedCommit.commitUrl} target="_blank" className="hover:underline text-muted-foreground">{data.commitedCommit.message}</Link></span>
      {data.commitedCommit.statusCheckRollup && <Status state={data.commitedCommit.statusCheckRollup.state} />}
      <CommitLink commit={data.commitedCommit} />
    </div>
  );
}
