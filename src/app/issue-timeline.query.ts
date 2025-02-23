import { PullRequestThreadFragment } from './timeline/components/pull-request-thread/pull-request-thread.fragment';
import { ActorFragment } from '@/components/user/user.fragment';
import { PullRequestTimelineFragment } from './timeline/pull-request.fragment';

export const issueTimelineQuery = /* GraphQL */ `
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

  ${PullRequestTimelineFragment}
  ${PullRequestThreadFragment}
  ${ActorFragment}
`;
