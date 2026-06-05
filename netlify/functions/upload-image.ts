import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response("Expected multipart/form-data", { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") {
    return new Response("No file provided", { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return new Response("Unsupported file type. Use JPEG, PNG, WEBP, GIF, or HEIC.", { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return new Response("File too large. Maximum size is 10 MB.", { status: 400 });
  }

  const timestamp = Date.now();
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  const key = `${timestamp}-${safeName}`;

  const store = getStore("listing-photos");
  const buffer = await file.arrayBuffer();
  await store.set(key, buffer);

  return Response.json({
    key,
    url: `/api/images/${encodeURIComponent(key)}`,
  });
};

export const config: Config = {
  path: "/api/upload-image",
};
