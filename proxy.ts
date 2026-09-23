import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN =
  (process.env.ROOT_DOMAIN ?? "oyingoldretail.com")
    .toLowerCase()
    .replace(/\/$/, "");

export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  const rawHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";

  const hostname = rawHost
    .split(":")[0]
    .toLowerCase();

  const isAdminHost =
    hostname === `admin.${ROOT_DOMAIN}` ||
    hostname === "admin.localhost";

  const isAdminPath = url.pathname.startsWith("/admin");

  // admin.oyingoldretail.com/*
  if (isAdminHost) {
    // Don't rewrite /admin/* again.
    if (isAdminPath) {
      return NextResponse.next();
    }

    // /                    -> /admin
    // /login               -> /admin/login
    // /products            -> /admin/products
    const rewrittenPath =
      url.pathname === "/"
        ? "/admin"
        : `/admin${url.pathname}`;

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewrittenPath;

    return NextResponse.rewrite(rewriteUrl);
  }

  // Redirect /admin/* on the main domain
  // to the admin subdomain.
  if (
    isAdminPath &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1"
  ) {
    const adminPath =
      url.pathname.replace(/^\/admin/, "") || "/";

    const redirectUrl = new URL(
      adminPath + url.search,
      `https://admin.${ROOT_DOMAIN}`
    );

    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};






// import { NextRequest, NextResponse } from "next/server";

// // Set NEXT_PUBLIC_ROOT_DOMAIN in your env (e.g. "oyingold.com") for production.
// const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "oyingoldretail.com";

// export function proxy(request: NextRequest) {
//   const url = request.nextUrl;
//   const hostname = request.headers.get("host") ?? "";

//   const isAdminHost =
//     hostname === `admin.${ROOT_DOMAIN}` ||
//     hostname.startsWith("admin.localhost"); // lets you test locally at admin.localhost:3000

//   const isAdminPath = url.pathname.startsWith("/admin");

//   if (isAdminHost) {
//     // Already targeting an /admin path (e.g. someone linked directly) - let it through as-is.
//     if (isAdminPath) {
//       return NextResponse.next();
//     }

//     // admin.oyingold.com/          -> /admin
//     // admin.oyingold.com/login     -> /admin/login
//     // admin.oyingold.com/products  -> /admin/products
//     const rewrittenPath = url.pathname === "/" ? "/admin" : `/admin${url.pathname}`;
//     return NextResponse.rewrite(new URL(rewrittenPath + url.search, request.url));
//   }

//   // On the main domain, don't let /admin be reachable directly in production -
//   // send visitors to the admin subdomain instead so there's one canonical URL for it.
//   if (isAdminPath && hostname !== "localhost:3000" && !hostname.startsWith("127.0.0.1")) {
//     const adminPath = url.pathname.replace(/^\/admin/, "") || "/";
//     const redirectUrl = new URL(adminPath + url.search, `https://admin.${ROOT_DOMAIN}`);
//     return NextResponse.redirect(redirectUrl, 308);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   // Runs on everything except static assets and Next internals.
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
// };