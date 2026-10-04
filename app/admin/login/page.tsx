import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin/get-admin-session";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin/lessons");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Synapse Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your admin account.
        </p>
      </div>
      <AdminLoginForm />
    </div>
  );
}
