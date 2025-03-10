import MarkdownToJSX from 'markdown-to-jsx'

interface MarkdownProps {
  content: string
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="prose dark:prose-invert max-w-none px-4">
      <MarkdownToJSX
        options={{
          overrides: {
            img: { props: { style: { maxWidth: '100%' } } },
            pre: {
              props: {
                className: 'mb-4 bg-accent rounded-md px-4 py-2',
                style: {
                  whiteSpace: 'pre-wrap'
                }
              }
            },
            code: {
              props: {
                className: 'bg-secondary text-[85%] px-1 py-0.5 rounded-md',
                style: {
                  whiteSpace: 'pre-wrap'
                }
              }
            },
            h1: {
              props: { className: 'text-3xl font-semibold mb-3 pb-1 border-b-2 border-daw-gray-200' }
            },
            h2: {
              props: { className: 'text-2xl font-semibold mb-3' }
            },
            h3: {
              props: { className: 'text-xl font-semibold mb-3' }
            },
            li: {
              props: { className: 'mb-1 ml-6 list-disc' }
            },
            ul: {
              props: { className: 'mb-4' }
            },
            a: {
              component: (props: React.HTMLProps<HTMLAnchorElement>) => (
                <a
                  {...props}
                  className="underline hover:text-blue-600"
                  target="_blank"
                >
                  {props.children}
                </a>
              )
            },
            p: {
              props: {
                className: 'mb-4',
                style: {
                  wordBreak: 'break-word'
                }
              }
            }
          },
        }}
      >{content}</MarkdownToJSX>
    </div>
  )
}
