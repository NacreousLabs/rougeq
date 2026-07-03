import { isAuthed } from "@/lib/admin-auth";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

// Shared admin chrome. The toolbar only shows once signed in, so the login page
// (rendered when unauthed) stays bare. Each page still calls requireAuth itself.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthed();
  if (!authed) return <>{children}</>;
  return (
    <div className="flex flex-1 flex-col">
      <AdminNav />
      {children}
    </div>
  );
}
