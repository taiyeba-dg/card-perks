import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        strong: ({ children }) => <strong className="font-semibold text-gold">{children}</strong>,
        a: ({ children, href }) => <a href={href} className="text-gold underline underline-offset-2 hover:text-gold/80">{children}</a>,
        table: ({ children }) => <div className="overflow-x-auto my-3"><table className="w-full text-xs border-collapse">{children}</table></div>,
        thead: ({ children }) => <thead className="border-b border-border/40">{children}</thead>,
        th: ({ children }) => <th className="text-left py-1.5 px-2 text-gold font-medium">{children}</th>,
        td: ({ children }) => <td className="py-1.5 px-2 border-b border-border/20">{children}</td>,
        ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
        li: ({ children }) => <li className="flex gap-1.5 items-start"><span className="text-gold mt-1.5 text-[6px]">●</span><span>{children}</span></li>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
