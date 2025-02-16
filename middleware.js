import arcjet, {
  createMiddleware,
  detectBot,
  shield,
  createRemoteClient,
} from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Create a remote client with a longer timeout (2 seconds in this example)
const client = createRemoteClient({
  // Optionally set ARCJET_BASE_URL if required
  timeout: 2000, // Increase timeout to 2000ms (2 seconds)
});

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // Use "ip.src" as the characteristic key that Arcjet expects
  characteristics: ["ip.src", "userId", "userAgent"],
  // Trust all proxies (replace with a specific range if you know it)
  proxies: ["0.0.0.0/0"],
  // Pass in the remote client with the increased timeout
  client,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE", // Use "DRY_RUN" to log without blocking
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc.
        "GO_HTTP", // For Inngest
        "CLOUD_HOSTING", // For hosting purpose
        "PROXY",
        "CLOUD_COMPUTING", // For hosting purpose
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

// Custom middleware to extract and normalize client IP, and attach it for Arcjet.
export default async function middleware(req, ev) {
  let clientIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.socket?.remoteAddress;

  // If the header contains multiple IPs, use the first one.
  if (clientIp && clientIp.includes(",")) {
    clientIp = clientIp.split(",")[0].trim();
  }

  console.log("Client IP:", clientIp);

  // Attach the extracted IP on both properties (for common usage)
  req.clientIp = clientIp;
  req.ip = clientIp;

  // Proceed with the Arcjet and Clerk middleware.
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
