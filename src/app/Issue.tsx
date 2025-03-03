import Markdown from 'markdown-to-jsx';
import { MarkGithubIcon } from "@primer/octicons-react"
import { Issue, PullRequest } from '@/generated/graphql';
import { IssueTimelineFragment } from './timeline/issue.fragment';

// export function IssuePage({ owner, repo, number }: { owner: string, repo: string, number: number }) {
//   const { data: res } = useQuery<{ repository: Repository }>({
//     queryKey: [IssuePage.query(), { owner, repo, number }],
//     queryFn: () => runQuery([IssuePage.query(), { owner, repo, number }]),
//   });
//   const data = res?.repository.issue;
//   if (!data) {
//     return null;
//   }

//   return (
//     <div className="flex flex-col gap-4 my-4 max-w-3xl mx-auto">
//       <Header data={data} />
//       <CommentCard data={data} />
//       <Timeline items={data.timelineItems.nodes!} />
//       <IssueCommentForm issue={data} />
//     </div>
//   );
// }

export const IssuePageQuery = () => `
query IssueTimeline($owner: String!, $repo: String!, $number: Int!) {
  repository(owner:$owner, name:$repo) {
    issue(number:$number) {
      __typename
      id
      number
      url
      title
      body
      createdAt
      state
      author {
        ...ActorFragment
      }
      reactionGroups {
        ...ReactionFragment
      }
      repository {
        name
        owner {
          login
          avatarUrl
        }
      }
      viewerCanClose
      timelineItems(first:100) {
        nodes {
          ...IssueTimelineFragment
        }
      }
    }
  }
}

${IssueTimelineFragment}
`;

export function Header({ data }: { data: Issue | PullRequest }) {
  return (
    <header className="flex items-center h-12 gap-2 mb-2 px-4  border-b">
      <MarkGithubIcon className="size-5 text-zinc-500" />
      <h1 className="text-sm">
        <Markdown>{data.title}</Markdown>
      </h1>
      {/* {'headRef' in data && data.headRef && <>
        <div className="flex items-center gap-2">
          <BranchName>{data.headRef!.name}</BranchName>
          <ArrowRightIcon className="text-daw-gray-700" />
          <BranchName>{data.baseRef!.name}</BranchName>
        </div>
      </>} */}
    </header>
  );
}
