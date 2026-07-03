import type { MetadataRoute } from "next";

// Allow normal indexing of RougeQ's own pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
