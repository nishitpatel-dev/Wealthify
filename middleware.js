import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // Use the built-in characteristic name for IP address.
  characteristics: ["ip.src", "userId", "userAgent"],
  // Trust all proxies so that Arcjet will extract the real client IP from the forwarded headers.
  // (Replace with your actual proxy range if possible.)
  proxies: ["0.0.0.0/0"],
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE", // Use "DRY_RUN" to log decisions without blocking.
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "GO_HTTP",
        "CLOUD_HOSTING",
        "PROXY",
        "CLOUD_COMPUTING",
      ],
    }),
  ],
});

const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
});

// Custom middleware to extract the client IP and attach it to the request.
export default async function middleware(req, ev) {
  // Attempt to extract the client IP from headers or the socket.
  const clientIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.socket?.remoteAddress;
  console.log("Client IP:", clientIp);

  // Attach the IP in two common properties so Arcjet can detect it.
  req.clientIp = clientIp;
  req.ip = clientIp;

  // Proceed with Arcjet and Clerk middleware.
  return createMiddleware(aj, clerk)(req, ev);
}

export const config = {
  matcher: [
    // Run middleware on all routes except for Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
