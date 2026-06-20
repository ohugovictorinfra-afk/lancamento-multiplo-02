import type { VercelRequest, VercelResponse } from "@vercel/node";

const PIXEL_ID = "647241233695896";
const CAPI_TOKEN = process.env.FACEBOOK_CAPI_TOKEN!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    event_name,
    event_id,
    event_source_url,
    client_user_agent,
    fbp,
    fbc,
    external_id,
    custom_data,
  } = req.body ?? {};

  if (!event_name) return res.status(400).json({ error: "event_name is required" });

  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "";

  const userData: Record<string, string> = {
    client_ip_address: clientIp,
    client_user_agent: client_user_agent ?? "",
  };
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (external_id) userData.external_id = external_id;

  const payload = {
    data: [
      {
        event_name,
        // event_id compartilhado com o browser pixel para deduplicação correta
        event_id: event_id ?? crypto.randomUUID(),
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: event_source_url ?? "",
        user_data: userData,
        ...(custom_data ? { custom_data } : {}),
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to send CAPI event" });
  }
}
