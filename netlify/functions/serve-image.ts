import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const EXT_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

export default async (
  req: Request,
  context: { params: { key: string } }
): Promise<Response> => {
  const key = decodeURIComponent(context.params.key);

  const store = getStore("listing-photos");
  const data = await store.get(key, { type: "arrayBuffer" });

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType = EXT_CONTENT_TYPES[ext] ?? "application/octet-stream";

  return new Response(data as ArrayBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const config: Config = {
  path: "/api/images/:key",
};
