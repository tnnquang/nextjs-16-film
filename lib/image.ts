"use server";

import { getPlaiceholder } from "plaiceholder";

export async function getBlurDataURL(src: string): Promise<string | undefined> {
  try {
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    );

    const { base64 } = await getPlaiceholder(buffer, { size: 10 });

    return base64;
  } catch (err) {
    console.error("Failed to generate blur data URL:", err);
    return undefined;
  }
}
