import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip next-intl for /admin — admin is not localized.
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
