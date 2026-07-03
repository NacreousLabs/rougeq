import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders admin-authored Markdown. react-markdown does not render raw HTML by
// default, so this is XSS-safe. Wrapped in Tailwind Typography `prose`.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
