import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SANITY_CACHE_TAG } from "@/sanity/live";

// Called by the Sanity webhook on every published change. <SanityLive> only
// refreshes the cache while a visitor has the site open; this covers the rest.
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ message: "Missing secret" }, { status: 500 });
  }
  const { isValidSignature } = await parseBody(request, secret);
  if (!isValidSignature) {
    return Response.json({ message: "Invalid signature" }, { status: 401 });
  }
  revalidateTag(SANITY_CACHE_TAG, { expire: 0 });
  return Response.json({ revalidated: true, now: Date.now() });
}
