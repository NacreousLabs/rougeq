import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

// Global MDX component overrides. Required by @next/mdx with the App Router.
// Internal links (href starting with "/") use next/link for client-side nav;
// external links open in a new tab.
const components: MDXComponents = {
  a: ({ href = "", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href.startsWith("/")) {
      return <Link href={href}>{children}</Link>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
};

export function useMDXComponents(existing: MDXComponents): MDXComponents {
  return { ...existing, ...components };
}
