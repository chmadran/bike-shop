import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdownClassName =
  'space-y-2 text-sm leading-relaxed [&_p]:text-pretty [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-background/60 [&_pre]:p-2 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:underline [&_a]:underline-offset-2 [&_hr]:border-border'

export function ChatAssistantMessage({ text }: { text: string }) {
  return (
    <div className={markdownClassName}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[16rem] border-collapse text-left text-xs">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="border-b border-border bg-background/50">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => (
          <th className="px-2 py-1.5 font-medium text-foreground">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1.5 align-top text-muted-foreground">{children}</td>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-foreground hover:opacity-80">
            {children}
          </a>
        ),
      }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
