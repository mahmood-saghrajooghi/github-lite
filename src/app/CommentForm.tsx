import { Issue, PullRequest } from "@octokit/graphql-schema";
import { IssuePage } from "./Issue";
import { PullRequestPage } from "./PullRequest";
import { github } from "@/lib/client";
import { mutate } from 'swr';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export function IssueCommentForm({issue}: {issue: Issue | PullRequest}) {
  const onSubmit = async (comment: string) => {
    await github.issues.createComment({
      owner: issue.repository.owner.login,
      repo: issue.repository.name,
      issue_number: issue.number,
      body: comment
    });

    mutate([
      issue.__typename === 'Issue' ? IssuePage.query() : PullRequestPage.query(),
      {
        owner: issue.repository.owner.login,
        repo: issue.repository.name,
        number: issue.number
      }
    ]);
  };

  return (
    <CommentForm onSubmit={onSubmit}>
      {issue.viewerCanClose && issue.state === 'OPEN' && <Button className="px-4 py-2 rounded-md bg-purple-500 pressed:bg-purple-600 border border-purple-400 pressed:border-purple-500 text-white text-sm font-medium cursor-default outline-none focus-visible:ring-2 ring-offset-2 ring-blue-600">Close</Button>}
    </CommentForm>
  );
}

export function CommentForm({children, className, onSubmit}: {children: ReactNode, className?: string, onSubmit?: (comment: string) => Promise<void>}) {
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

  return (
    <Form {...form}>
      <form className={`flex flex-col gap-2 items-end ${className}`} onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          {children}
          <Button type="submit" className="px-4 py-2 rounded-md bg-green-600 pressed:bg-green-700 border border-green-700 pressed:border-green-800 dark:border-green-500 dark:pressed:border-green-600 text-white text-sm font-medium cursor-default outline-none focus-visible:ring-2 ring-offset-2 ring-blue-600">Comment</Button>
        </div>
      </form>
    </Form>
  );
}
