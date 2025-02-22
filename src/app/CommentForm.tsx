import { GitPullRequestClosedIcon } from '@primer/octicons-react';
import { Issue, PullRequest } from "@octokit/graphql-schema";
import { github } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReactNode, useRef, useState, forwardRef   } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { queryClient } from '@/query-client';
import { getQueryKey } from '@/hooks/api/use-pr-query';
import { useUser } from '@/hooks/api/use-user';
import { isHotkey } from 'is-hotkey';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
  CommandInput,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover"
import { composeRefs } from '@/lib/compose-refs';
import { cn } from '@/lib/utils';

type IssueCommentFormProps = {
  issue: Issue | PullRequest,
} & React.HTMLAttributes<HTMLFormElement>

export const IssueCommentForm = forwardRef<HTMLFormElement, IssueCommentFormProps>(({ issue, className, ...props }, ref) => {
  const { data: user } = useUser();

  const onSubmit = async (comment: string) => {
    optimisticallyUpdatePullRequest({ owner: issue.repository.owner.login, repo: issue.repository.name, number: issue.number, user, values: { comment } });

    await github.issues.createComment({
      owner: issue.repository.owner.login,
      repo: issue.repository.name,
      issue_number: issue.number,
      body: comment
    });

    queryClient.invalidateQueries({ queryKey: getQueryKey(issue.repository.owner.login, issue.repository.name, issue.number) });
  };

  return (
    <CommentForm
      onSubmit={onSubmit}
      className={cn("focus:outline focus:outline-2 focus:outline-blue-500 focus-outline-offset-2 rounded-lg", className)}
      {...props}
      ref={ref}
    >
      {issue.viewerCanClose && issue.state === 'OPEN' &&
        <Button variant="outline" className="px-2 py-2 rounded-md text-white text-sm font-medium cursor-default">
          <GitPullRequestClosedIcon className="text-red-500" />
          Close pull request
        </Button>
      }
    </CommentForm>
  );
})

IssueCommentForm.displayName = 'IssueCommentForm';

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

type CommentFormProps = {
  children: ReactNode,
  className?: string,
  onSubmit?: (comment: string) => Promise<void>,
} & React.HTMLAttributes<HTMLFormElement>


export const CommentForm = forwardRef<HTMLFormElement, CommentFormProps>(({ children, className, onSubmit, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastCursorPosition = useRef(0);

  const [focused, setFocused] = useState(false);

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

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (isHotkey('mod+/', event)) {
      event.preventDefault();
      event.stopPropagation();
      lastCursorPosition.current = event.currentTarget.selectionStart;
      setOpen(true);
    }
  }

  function handleSelect(blockType: string) {
    setOpen(false)
    let currentValue = form.getValues('comment');

    let updatedCursorPos = lastCursorPosition.current;

    if (currentValue.length > 0) {
      // if there is content in the textarea, add the new block in a new line below the current
      // cursor position. then update the cursor position to be inside the added block.
      const lines = currentValue.split('\n');
      const currentLineIndex = currentValue.slice(0, updatedCursorPos).split('\n').length - 1;
      const upUntilTheEndOfCurrentLine = lines.slice(0, currentLineIndex + 1).join('\n');
      lines[currentLineIndex] = lines[currentLineIndex] + `\n\`\`\`${blockType}\n\n\`\`\``;
      updatedCursorPos = upUntilTheEndOfCurrentLine.length + `\n\`\`\`${blockType}\n`.length;
      currentValue = lines.join('\n');
    } else {
      currentValue = `\`\`\`${blockType}\n\n\`\`\``;
      updatedCursorPos = `\`\`\`${blockType}\n`.length;
    }


    form.setValue('comment', currentValue);

    queueMicrotask(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(updatedCursorPos, updatedCursorPos);
        textareaRef.current.focus();
      }
    });
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      textareaRef.current?.focus();
    }
    setOpen(open);
  }

  return (
    <Form {...form}>
      <form className={`flex flex-col gap-2 items-end ${className}`} onSubmit={form.handleSubmit(handleSubmit)} {...props} ref={ref}>
        <FormField
          control={form.control}
          name="comment"
          render={({ field: { ref, onBlur, ...field } }) => (
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverAnchor asChild>
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={1}
                      placeholder={`Reply ${focused ? '(⌘ + / to open shortcut menu)' : ''}`}
                      onKeyDown={handleKeyDown}
                      ref={composeRefs(ref, textareaRef)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => { onBlur(); setFocused(false); } }
                    />
                  </FormControl>
                </FormItem>
              </PopoverAnchor>
              <PopoverContent className=" p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search framework..." />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="suggestion"
                        onSelect={handleSelect}
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        suggestion
                      </CommandItem>
                      <CommandItem
                        value="tsx"
                        onSelect={handleSelect}
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        tsx
                      </CommandItem>
                      <CommandItem
                        value="typescript"
                        onSelect={handleSelect}
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        typescript
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
})

CommentForm.displayName = 'CommentForm';
