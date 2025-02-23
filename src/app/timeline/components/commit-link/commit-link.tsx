import { CommittedEventFragmentFragment } from '@/generated/graphql';
import { Link } from '@/components/link';

export function CommitLink({ commit }: { commit: CommittedEventFragmentFragment['commitedCommit'] }) {
  return <Link target="_blank" to={commit.commitUrl} className="text-sm hover:underline"><code>{commit.abbreviatedOid}</code></Link>;
}
