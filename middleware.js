import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip", "userId", "userAgent"],
  // Trust all proxies so Arcjet can extract the client IP from forwarded headers.
  // (Ideally, replace "0.0.0.0/0" with your actual proxy IP range if known.)
  proxies: ["0.0.0.0/0"],
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE", // Use "DRY_RUN" to log without blocking
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

// Custom middleware to extract client IP and attach it to the request.
export default async function middleware(req, ev) {
  // Extract the client IP from common headers or from the socket.
  const clientIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.socket?.remoteAddress;
  console.log("Client IP:", clientIp);
  // Attach the IP to the request object so Arcjet can use it as a characteristic.
  req.clientIp = clientIp;
  // Proceed with Arcjet and Clerk middleware.
  return createMiddleware(aj, clerk)(req, ev);
}

export const config = {
  matcher: [
    // Run middleware on all routes except Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
