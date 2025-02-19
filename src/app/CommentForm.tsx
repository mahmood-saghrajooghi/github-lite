import { GitPullRequestClosedIcon } from '@primer/octicons-react';
import { Issue, PullRequest } from "@octokit/graphql-schema";
import { github } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode, useRef } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { queryClient } from '@/query-client';
import { getQueryKey } from '@/hooks/api/use-pr-query';
import { useUser } from '@/hooks/api/use-user';
import isHotkey from 'is-hotkey';

export function IssueCommentForm({ issue }: { issue: Issue | PullRequest }) {
  const { data: user } = useUser();

  const onSubmit = async (comment: string) => {
    optimisticallyUpdatePullRequest({ owner: issue.repository.owner.login, repo: issue.repository.name, number: issue.number, user: user, values: comment });

    await github.issues.createComment({
      owner: issue.repository.owner.login,
      repo: issue.repository.name,
      issue_number: issue.number,
      body: comment
    });

    queryClient.invalidateQueries({ queryKey: getQueryKey(issue.repository.owner.login, issue.repository.name, issue.number) });
  };

  return (
    <CommentForm onSubmit={onSubmit}>
      {issue.viewerCanClose && issue.state === 'OPEN' &&
        <Button variant="outline" className="px-2 py-2 rounded-md text-white text-sm font-medium cursor-default">
          <GitPullRequestClosedIcon className="text-red-500" />
          Close pull request
        </Button>
      }
    </CommentForm>
  );
}

type CommentFormProps = {
  children: ReactNode,
  className?: string,
  onSubmit?: (comment: string) => Promise<void>,
}

function optimisticallyUpdatePullRequest({ owner, repo, number, user, values }: { owner: string, repo: string, number: number, user: any, values: any }) {
  queryClient.setQueryData(getQueryKey(owner, repo, number), (data: any) => {
    return {
      ...data,
      repository: {
        ...data.repository,
        pullRequest: {
          ...data.repository.pullRequest,
          timelineItems: {
            nodes: [
              ...data.repository.pullRequest.timelineItems.nodes,
              {
                __typename: "IssueComment",
                author: { login: user?.login, avatarUrl: user?.avatar_url, url: user?.url },
                body: values.comment,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                url: `https://github.com/${owner}/${repo}/issues/${number}/comments`,
                id: "1",
                reactionGroups: data.repository.pullRequest.reactionGroups
              }
            ]
          }
        }
      }
    }
  });
}

export function CommentForm({ children, className, onSubmit }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const formSchema = z.object({
    comment: z.string().min(1)
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: ""
    }
  })


  const handleSubmit = async (values: z.infer<typeof formSchema>) => {

    if (onSubmit) {
      await onSubmit(values.comment);
    }
    form.reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isHotkey('mod+enter', e)) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        className={`flex flex-col gap-2 items-end ${className}`}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea
                  {...field}
                  rows={1}
                  placeholder="Reply..."
                  onKeyDown={handleKeyDown}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          {children}
          <Button
            type="submit"
            className="rounded-md text-sm font-medium cursor-default outline-none"
          >
            Comment
          </Button>
        </div>
      </form>
    </Form>
  );
}
