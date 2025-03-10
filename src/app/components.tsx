import { CheckConclusionState, PullRequestReviewDecision, PullRequestReviewState, StatusState } from '@octokit/graphql-schema';
import { AlertIcon, CheckIcon, CommentIcon, StopIcon, XIcon, GitPullRequestIcon, GitPullRequestDraftIcon } from '@primer/octicons-react';
import { DOMAttributes, ReactNode, cloneElement } from 'react';
import type { PullRequest, Issue } from '@/generated/graphql';

const avatarSizes = {
  xs: 'w-4',
  s: 'w-5',
  m: 'w-8',
  l: 'w-10'
}

export function Avatar({ src, size = 's', className }: { size?: keyof typeof avatarSizes, src: string, className?: string }) {
  return <img src={src} className={`${avatarSizes[size]} aspect-square rounded-full ${className}`} />;
}

export function BranchName({ children }: { children: string }) {
  return <span className="bg-daw-blue-100 border border-daw-blue-200 text-daw-blue-800 text-xs font-mono py-[2px] px-2 rounded">{children}</span>;
}

const states = {
  MERGED: 'border-purple-200 text-purple-500',
  CLOSED: 'border-red-200 text-red-500',
  OPEN: 'text-green-500',
  DRAFT: 'text-muted-foreground'
};

export function IssueStatus({ data }: { data: PullRequest | Issue }) {
  let state: keyof typeof states = data.state;
  if ('isDraft' in data && data.isDraft) {
    state = 'DRAFT';
  }

  function getIcon() {
    if (state === 'OPEN') {
      return <GitPullRequestIcon className="text-green-500" />
    }
    if (state === 'DRAFT') {
      return <GitPullRequestDraftIcon />
    }
    if (state === 'MERGED') {
      return <GitPullRequestIcon />
    }
    return state.toLowerCase();
  }
  return (
    <div className={`flex items-center gap-1 capitalize w-fit py-0.5 ${states[state]}`}>
      {getIcon()}
      {state.toLowerCase()}
      <span className="w-[3px] h-[3px] rounded-full bg-zinc-500" />
    </div>
  )
}

const checkStates = {
  EXPECTED: 'bg-yellow-500',
  PENDING: 'bg-yellow-500',
  ACTION_REQUIRED: 'bg-yellow-500',
  ERROR: 'bg-red-500',
  FAILURE: 'bg-red-500',
  SUCCESS: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
  NEUTRAL: 'bg-gray-500',
  SKIPPED: 'bg-gray-500',
  STALE: 'bg-gray-500',
  STARTUP_FAILURE: 'bg-red-500',
  TIMED_OUT: 'bg-red-500',

  CHANGES_REQUESTED: 'bg-red-500',
  REVIEW_REQUIRED: 'bg-red-500',
  APPROVED: 'bg-green-500',
  COMMENTED: 'bg-gray-500',
  DISMISSED: 'bg-gray-500'
};

const checkIcons = {
  EXPECTED: null,
  PENDING: null,
  ERROR: null,
  FAILURE: <XIcon className="text-red-500" />,
  ACTION_REQUIRED: <AlertIcon className="text-yellow-600" />,
  CANCELLED: <StopIcon className="text-gray-500" />,
  STARTUP_FAILURE: <XIcon className="text-red-500" />,
  TIMED_OUT: <XIcon className="text-red-500" />,
  SUCCESS: <CheckIcon className="text-green-500" />,
  NEUTRAL: null,
  STALE: null,
  SKIPPED: null,

  CHANGES_REQUESTED: <XIcon className="text-red-500" />,
  REVIEW_REQUIRED: <XIcon className="text-red-500" />,
  APPROVED: <CheckIcon className="text-green-500" />,
  COMMENTED: <CommentIcon className="text-gray-500" />,
  DISMISSED: null
};

export function Status({ state, filled }: { state: StatusState | CheckConclusionState | PullRequestReviewState | PullRequestReviewDecision, filled?: boolean }) {
  const icon = checkIcons[state];
  if (filled && icon) {
    return <span className={`w-5 h-5 rounded-full text-white flex items-center justify-center ${checkStates[state]}`}>{cloneElement(icon, { className: 'text-white' })}</span>
  }
  if (icon) {
    return icon;
  }
  return <span className={`w-2 h-2 rounded-full ${checkStates[state]}`} />
}

interface CardProps extends DOMAttributes<Element> {
  children: ReactNode,
  gridArea?: string
}

export function Card({ children, gridArea, ...otherProps }: CardProps) {
  return (
    <div className="bg-daw-white border border-daw-gray-200 rounded-lg p-3" style={{ gridArea }} {...otherProps}>
      {children}
    </div>
  );
}

export function Icon({ className, children }: { className: string, children: ReactNode }) {
  return <div className={`rounded-full px-1.5 aspect-square flex items-center ${className}`}>{children}</div>
}

export function GithubLabel({ color, children }: { color: string, children: ReactNode }) {
  return (
    <span
      className="px-3 py-0.5 text-black rounded-full text-xs font-semibold border"
      style={{ background: `#${color}66`, borderColor: `#${color}66`, color: `color-mix(in srgb, #${color}, black 70%)` }}>
      {children}
    </span>
  );
}
