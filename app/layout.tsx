import type { ReactNode } from "react";

/**
 * Pass-through root layout. Public pages keep html/body in [locale]/layout;
 * admin pages define their own in app/admin/layout.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
