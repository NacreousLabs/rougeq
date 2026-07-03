import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAllowedAdmin } from "@/lib/admins";

// Access to /admin is gated by an allowlist: the ADMIN_GITHUB_LOGIN "owner" plus
// anyone added in /admin/users (see src/lib/admins.ts). Fails closed — an empty
// allowlist lets nobody in. Auth.js also refuses to run without AUTH_SECRET.
function ghLogin(profile: unknown): string {
  return String((profile as { login?: string } | null)?.login ?? "").toLowerCase();
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Always trust the host — this app runs behind Railway's proxy (non-Vercel),
  // where Auth.js otherwise requires AUTH_TRUST_HOST=true and 500s without it.
  trustHost: true,
  providers: [GitHub],
  pages: { signIn: "/admin/login" },
  callbacks: {
    async signIn({ profile }) {
      return isAllowedAdmin(ghLogin(profile));
    },
    // Persist the GitHub login so the allowlist can be re-checked on every
    // request (so removing someone revokes their existing session immediately).
    jwt({ token, profile }) {
      const login = ghLogin(profile);
      if (login) (token as { login?: string }).login = login;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { login?: string }).login = (token as { login?: string }).login;
      }
      return session;
    },
  },
});
