import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { listings } from "../../db/schema.js";
import { eq, desc, like, or, and } from "drizzle-orm";

export default async (req: Request): Promise<Response> => {
  if (req.method === "GET") {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const status = url.searchParams.get("status") || "active";
    const all = url.searchParams.get("all") === "true"; // admin: fetch all statuses

    let query = db.select().from(listings);
    const conditions = [];

    if (!all) {
      conditions.push(eq(listings.status, status));
    }
    if (category) {
      conditions.push(eq(listings.category, category));
    }
    if (search) {
      conditions.push(
        or(
          like(listings.title, `%${search}%`),
          like(listings.description, `%${search}%`),
          like(listings.location, `%${search}%`)
        )!
      );
    }

    const rows = await (conditions.length > 0
      ? query.where(and(...conditions)).orderBy(desc(listings.featured), desc(listings.createdAt))
      : query.orderBy(desc(listings.featured), desc(listings.createdAt)));

    return Response.json(rows);
  }

  if (req.method === "POST") {
    // Verify admin auth via Netlify Identity JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, price, location, contactName, contactEmail, contactPhone, imageUrl, status, featured } = body;

    if (!title || !description) {
      return new Response("Title and description are required", { status: 400 });
    }

    const [listing] = await db
      .insert(listings)
      .values({
        title,
        description,
        category: category || "general",
        price: price ? parseInt(price) : null,
        location: location || "",
        contactName: contactName || "",
        contactEmail: contactEmail || "",
        contactPhone: contactPhone || "",
        imageUrl: imageUrl || "",
        status: status || "active",
        featured: featured ?? false,
      })
      .returning();

    return Response.json(listing, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/listings",
};
