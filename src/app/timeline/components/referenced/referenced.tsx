import { ReferencedEvent } from '@octokit/graphql-schema';
import { CrossReferenceIcon } from '@primer/octicons-react';
import { Link } from '@tanstack/react-router';
import { CommitLink } from '../commit-link/commit-link';
import { Icon, Status } from '@/app/components';
import { User } from '@/components/user/user';

export function Referenced({ data }: { data: ReferencedEvent }) {
  return (
    <div
      className="grid items-center gap-2"
      style={{
        gridTemplateAreas: `
          "icon description"
          ".    commit"
        `,
        gridTemplateColumns: 'min-content 1fr'
      }}>
      <Icon className="bg-accent text-muted-foreground"><CrossReferenceIcon /></Icon>
      <span className="text-muted-foreground">
        <User actor={data.actor!} /> referenced this pull request
      </span>
      <div style={{ gridArea: 'commit' }} className="flex gap-2">
        <span className="flex-1 line-clamp-2 text-sm"><Link to={data.commit!.commitUrl} target="_blank" className="hover:underline">{data.commit!.message}</Link></span>
        {data.commit!.statusCheckRollup && <Status state={data.commit!.statusCheckRollup.state} />}
        <CommitLink commit={data.commit!} />
      </div>
    </div>
  );
}
