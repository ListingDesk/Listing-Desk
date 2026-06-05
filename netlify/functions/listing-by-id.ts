import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { listings } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export default async (req: Request, context: { params: { id: string } }): Promise<Response> => {
  const id = parseInt(context.params.id);
  if (isNaN(id)) return new Response("Invalid ID", { status: 400 });

  if (req.method === "GET") {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    if (!listing) return new Response("Not found", { status: 404 });
    return Response.json(listing);
  }

  // Mutation methods require auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (req.method === "PATCH") {
    const body = await req.json();
    const { title, description, category, price, location, contactName, contactEmail, contactPhone, imageUrl, status, featured } = body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = price === "" || price === null ? null : parseInt(price);
    if (location !== undefined) updates.location = location;
    if (contactName !== undefined) updates.contactName = contactName;
    if (contactEmail !== undefined) updates.contactEmail = contactEmail;
    if (contactPhone !== undefined) updates.contactPhone = contactPhone;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (status !== undefined) updates.status = status;
    if (featured !== undefined) updates.featured = featured;

    const [updated] = await db.update(listings).set(updates).where(eq(listings.id, id)).returning();
    if (!updated) return new Response("Not found", { status: 404 });
    return Response.json(updated);
  }

  if (req.method === "DELETE") {
    await db.delete(listings).where(eq(listings.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/listings/:id",
};
