import { PullRequest, PullRequestReviewDecision, Repository } from '@octokit/graphql-schema';
import { Link } from '@tanstack/react-router';
import { Fragment, createContext } from 'react';
import { Button, } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Timeline } from '@/app/TimeLine';
import { Card, Status, User } from '@/app/components';
import { github } from '@/lib/client';
import { parseDiff, Diff as DiffView, Hunk } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import { usePRDiffQuery } from '@/hooks/api/use-pr-diff-query';


export const PullRequestContext = createContext<PullRequest | null>(null);

export function PullRequestPage({ owner, repo, number }: { owner: string, repo: string, number: number }) {
}

const getDiff = async (owner: string, repo: string, number: number) => {
  const res = await github.pulls.get({
    owner,
    repo,
    pull_number: number,
    headers: {
      accept: "application/vnd.github.v3.diff", // Request diff format
    },
  });
  return res.data;
}


function renderFile({ oldRevision, newRevision, type, hunks }: any) {
  return (
    <DiffView
      key={oldRevision + '-' + newRevision}
      viewType="split"
      diffType={type}
      hunks={hunks}
    >
      {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
    </DiffView>
  );
}


function Diff({ data }: { data: PullRequest }) {
  const { data: diff } = usePRDiffQuery(data.repository.owner.login, data.repository.name, data.number);


  if (!diff) {
    return null;
  }

  const files = parseDiff(diff);

  return (
    <div className="text-xs font-mono">
      {files.map(file => renderFile(file))}
    </div>
  );
}

PullRequestPage.query = () => `
query issueTimeline($owner: String!, $repo: String!, $number: Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$number) {
      __typename
      id
      number
      url
      title
      body
      createdAt
      state
      isDraft
      author {
        avatarUrl
        url
        login
      }
      reactionGroups {
        content
        viewerHasReacted
        reactors {
          totalCount
        }
      }
      repository {
        name
        owner {
          login
          avatarUrl
        }
      }
      headRef {
        name
      }
      baseRef {
        name
      }
      reviews(last:100) {
        nodes {
          author {
            ...ActorFragment
          }
          state
        }
      }
      commits(last:1) {
        nodes {
          commit {
            statusCheckRollup {
              state
            }
          }
        }
      }
      mergeable
      reviewDecision
      viewerCanMergeAsAdmin
      viewerCanClose
      viewerCanUpdateBranch
      timelineItems(first:100) {
        nodes {
          ...PullRequestTimelineFragment
        }
      }
      reviewThreads(first:100) {
        nodes {
          ...PullRequestThreadFragment
        }
      }
      reviewRequests(first:100) {
        nodes {
          requestedReviewer {
            __typename
            ... on User {
              login
              avatarUrl
              url
            }
            ... on Team {
              name
              url
            }
          }
        }
      }
    }
  }
}

${Timeline.pullRequestFragment()}
`;

export function PullHeader({ data }: { data: PullRequest }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 text-sm">
        <Reviews data={data} />
        <hr className="border-daw-gray-200" />
        <Checks data={data} />
        {data.state === 'OPEN' && <>
          <hr className="border-daw-gray-200" />
          <Merge data={data} />
        </>}
      </div>
    </Card>
  );
}

let reviewDecisionMessages: Record<PullRequestReviewDecision, string> = {
  APPROVED: 'Approved',
  REVIEW_REQUIRED: 'Review required',
  CHANGES_REQUESTED: 'Changes requested'
};

function Reviews({ data }: { data: PullRequest }) {
  let reviews = data.reviews?.nodes?.filter(node => node?.author?.login !== data.author?.login);
  if (!reviews || !reviews.length) {
    return <div>No reviews.</div>;
  }

  let reviewsByAuthor = new Map();
  for (let review of reviews) {
    reviewsByAuthor.set(review?.author?.login, review);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <h3 className="font-semibold">Reviews</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {[...reviewsByAuthor.values()]?.map((review, i) => (
          <li key={i} className="flex gap-2 items-center justify-between">
            <div><User actor={review.author} /></div>
            <div className="w-5 flex justify-center"><Status state={review.state} /></div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Checks({ data }: { data: PullRequest }) {
  let status = data.commits.nodes?.[0]?.commit.statusCheckRollup?.state;
  let checks = data.commits.nodes?.[0]?.commit.checkSuites?.nodes;

  if (status == null && checks?.length) {
    status = 'PENDING';
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Status state={status!} filled />
        <h3 className="font-semibold">Checks</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {checks?.map(check => {
          if (!check?.conclusion) {
            return null;
          }

          let summary = (
            <div className="flex gap-2 items-center">
              <div className="w-5 flex justify-center"><Status state={check!.conclusion!} /></div>
              <img src={check!.app?.logoUrl} className="w-8 h-8 rounded" style={{ backgroundColor: '#' + check!.app?.logoBackgroundColor }} alt="" />
              <div className="flex flex-col">
                <span>{check!.app?.name}</span>
                {check!.conclusion === 'ACTION_REQUIRED' && <span className="text-daw-gray-500 text-xs">Awaiting approval</span>}
              </div>
            </div>
          );

          if (check?.checkRuns?.nodes?.length === 0) {
            return (
              <li key={check.id}>
                {summary}
              </li>
            );
          }

          if ((check?.checkRuns?.nodes?.length as number) > 1) {
            return (
              <li key={check.id} className="flex flex-col gap-2">
                <details>
                  <summary className="flex items-center">
                    {summary}
                  </summary>
                  <ul className="flex flex-col gap-2 ml-4 mt-2">
                    {check?.checkRuns?.nodes?.map((node) => (
                      <li key={node!.id} className="flex gap-2 items-center">
                        <div className="w-5 flex justify-center"><Status state={node!.conclusion!} /></div>
                        <div className="flex flex-col">
                          <Link target="_blank" href={node!.detailsUrl}>{node!.name}</Link>
                          <span className="text-daw-gray-500 text-xs">{node!.isRequired ? 'Required' : 'Not required'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          }

          return (
            <Fragment key={check.id}>
              {check?.checkRuns?.nodes?.map(node => (
                <li key={node!.id} className="flex gap-2 items-center">
                  <div className="w-5 flex justify-center"><Status state={node!.conclusion!} /></div>
                  <img src={check!.app?.logoUrl} className="w-8 h-8 rounded" style={{ backgroundColor: '#' + check!.app?.logoBackgroundColor }} alt="" />
                  <div className="flex flex-col">
                    <Link target="_blank" href={node!.detailsUrl}>{node!.name}</Link>
                    <span className="text-daw-gray-500 text-xs">{node!.isRequired ? 'Required' : 'Not required'}</span>
                  </div>
                </li>
              ))}
            </Fragment>
          );
        })}
      </ul>
    </div>
  );
}

function Merge({ data }: { data: PullRequest }) {
  if (data.mergeable !== 'MERGEABLE') {
    return (
      <div className="flex gap-2 items-center justify-space-between">
        <p className="text-xs text-daw-gray-600 [text-wrap:balance] flex-1">Conflicts must be resolved before merging.</p>
        {data.viewerCanUpdateBranch &&
          <Button className="flex-shrink-0 px-4 py-2 rounded-md bg-gray-600 pressed:bg-gray-700 border border-gray-500 pressed:border-gray-600 text-white cursor-default outline-none focus-visible:ring-2 ring-offset-2 ring-blue-600">Update branch</Button>
        }
      </div>
    );
  }

  if (data.reviewDecision === 'APPROVED') {
    return (
      <div className="flex gap-2 justify-end">
        <Button className="px-4 py-2 rounded-md bg-green-600 pressed:bg-green-700 border border-green-700 pressed:border-green-800 dark:border-green-500 dark:pressed:border-green-600 text-white cursor-default outline-none focus-visible:ring-2 ring-offset-2 ring-blue-600">Merge</Button>
      </div>
    );
  }

  if (data.viewerCanMergeAsAdmin) {
    return (
      <div className="flex gap-2 items-center justify-space-between">
        <p className="text-xs text-daw-gray-600 [text-wrap:balance]">Use your administrator privileges to merge this pull request immediately without waiting for requirements to be met.</p>
        <Button className="flex-shrink-0 px-4 py-2 rounded-md bg-red-600 pressed:bg-red-700 border border-red-500 pressed:border-red-600 text-white cursor-default outline-none focus-visible:ring-2 ring-offset-2 ring-blue-600">Merge as administrator</Button>
      </div>
    );
  }

  return null;
}
