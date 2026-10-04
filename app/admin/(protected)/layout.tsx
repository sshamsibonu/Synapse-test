import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin/get-admin-session";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * AdminRoute: wraps every /admin/* page except /admin/login.
 * Convenience only — RLS is the real write protection.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav email={session.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
