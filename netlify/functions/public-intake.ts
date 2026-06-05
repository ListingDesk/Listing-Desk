import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { listings } from "../../db/schema.js";

type IntakePayload = {
  title: string;
  category: string;
  price: string | number;
  condition: string;
  location: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  imageUrls: string[];
  metadata?: {
    vin?: string;
    mileage?: string;
    hours?: string;
    hullId?: string;
  };
};

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: IntakePayload;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const {
    title,
    category,
    price,
    condition,
    location,
    description,
    contactName,
    contactEmail,
    contactPhone,
    imageUrls,
    metadata,
  } = body;

  if (!title?.trim()) {
    return new Response("Title is required", { status: 400 });
  }

  // Enrich description with structured metadata so admin can review key facts
  const metaLines: string[] = [];
  if (condition) metaLines.push(`Condition: ${condition}`);
  if (metadata?.vin) metaLines.push(`VIN: ${metadata.vin}`);
  if (metadata?.mileage) metaLines.push(`Mileage: ${metadata.mileage}`);
  if (metadata?.hours) metaLines.push(`Hours: ${metadata.hours}`);
  if (metadata?.hullId) metaLines.push(`Hull ID: ${metadata.hullId}`);

  const enrichedDescription =
    metaLines.length > 0
      ? `${metaLines.join(" | ")}\n\n${description ?? ""}`.trim()
      : (description ?? "").trim() || "No description provided";

  const imageUrlsArr = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [];
  const primaryImageUrl = imageUrlsArr[0] ?? "";

  // Convert price from dollars to cents (buyers enter dollar amounts)
  let priceCents: number | null = null;
  if (price !== "" && price !== null && price !== undefined) {
    const parsed = parseFloat(String(price));
    if (!isNaN(parsed) && parsed > 0) {
      priceCents = Math.round(parsed * 100);
    }
  }

  const [listing] = await db
    .insert(listings)
    .values({
      title: title.trim(),
      description: enrichedDescription,
      category: category || "general",
      price: priceCents,
      location: location || "",
      contactName: contactName || "",
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      imageUrl: primaryImageUrl,
      imageUrls: imageUrlsArr.length > 0 ? JSON.stringify(imageUrlsArr) : null,
      status: "unposted",
      featured: false,
    })
    .returning({ id: listings.id });

  return Response.json({ id: listing.id, success: true }, { status: 201 });
};

export const config: Config = {
  path: "/api/intake",
};
