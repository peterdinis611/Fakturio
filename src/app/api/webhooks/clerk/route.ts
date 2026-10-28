import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";

/**
 * Clerk user lifecycle webhook.
 * Configure endpoint URL .../api/webhooks/clerk and set CLERK_WEBHOOK_SIGNING_SECRET.
 * Primary sync still happens via ensureCurrentUser() on app entry.
 */
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const type = evt.type;

    if (
      type === "user.created" ||
      type === "user.updated" ||
      type === "user.deleted"
    ) {
      // Intentionally lightweight: app upserts on first authenticated request.
      // Extend here to push deletes/updates into the ASP.NET Users table if needed.
      console.info(`[clerk-webhook] ${type}`, "id" in evt.data ? evt.data.id : undefined);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("[clerk-webhook] verification failed", error);
    return new Response("invalid", { status: 400 });
  }
}
