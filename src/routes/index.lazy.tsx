import { RestEndpointMethodTypes } from '@octokit/rest';
import { github } from '@/lib/client';
import { LoginPage } from '@/app/login/page';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

type PullRequest = RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["response"]["data"]["items"][0];

export const Route = createLazyFileRoute('/')({
  component: App,
})


export default function App() {
  return (
    <>
      {localStorage.token ? (
          <Notifications />
      ) : (
        <LoginPage />
      )}
     </>
  );
}


function Notifications() {
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <div className="flex flex-1">
    </div>
  );
}

function useMarkAsRead(id: string) {
  return useMutation({
    mutationFn: async () => github.activity.markThreadAsRead({ thread_id: Number(id) }),
  });
}
