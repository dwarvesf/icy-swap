import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Server-side proxy for the one backend call that carries the ApiKey.
 *
 * The key used to ship in the browser bundle as NEXT_PUBLIC_API_KEY, which
 * made it public and therefore worthless as a credential. Holding it here
 * keeps it out of the bundle entirely; the real caller identity is the
 * EIP-712 wallet signature inside the body, which passes through untouched.
 *
 * ICY_BACKEND_API_KEY is the intended (server-only) variable. The
 * NEXT_PUBLIC_API_KEY fallback keeps today's deploy env working until the
 * key is rotated and renamed; once only the rotated server-side var exists,
 * nothing here has to change.
 */
const API_KEY = process.env.ICY_BACKEND_API_KEY || process.env.NEXT_PUBLIC_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BE_API;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }
  if (!API_KEY || !BASE_URL) {
    // Config error, not a user error. Say so without leaking which var.
    return res.status(500).json({ message: "Swap service is not configured" });
  }

  try {
    const upstream = await fetch(`${BASE_URL}/swap/generate-signature`, {
      method: "POST",
      headers: {
        Authorization: `ApiKey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const body = await upstream.text();
    res
      .status(upstream.status)
      .setHeader(
        "Content-Type",
        upstream.headers.get("content-type") ?? "application/json"
      );
    return res.send(body);
  } catch {
    return res.status(502).json({ message: "Swap service is unreachable" });
  }
}
