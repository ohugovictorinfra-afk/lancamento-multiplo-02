import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "crypto";

const PIXEL_ID = "647241233695896";
const CAPI_TOKEN = process.env.FACEBOOK_CAPI_TOKEN ?? "EAADZAMn8gPFsBRyVdZAQ2khJCWLiZCNTjvkLLLZANGjb2jBXKmGeTdi9coMUGxs2MZCXLtGiIOwjTmtUUU6ZAG6lf07fsavVtjh10xMpF4ZCZC5SYZCn4hFeGyUfKPZA7Jsko3Gb3eMbFnjsLdDD6lfHT8uCL7QpP5u6ZCew60NLwXFd5cq3IDuJyZBJaap4J8bSMwjZAcwZDZD";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

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
    // Advanced Matching fields from form
    em,    // email (raw — will be hashed here)
    ph,    // phone (raw — will be hashed here)
    fn,    // first name (raw)
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
  if (external_id) userData.external_id = sha256(external_id);
  if (em) userData.em = sha256(em);
  if (ph) {
    // Normalizar telefone: remover tudo que não é número, garantir DDI 55
    let phoneDigits = ph.replace(/\D/g, "");
    if (!phoneDigits.startsWith("55") && phoneDigits.length >= 10) {
      phoneDigits = "55" + phoneDigits;
    }
    userData.ph = sha256(phoneDigits);
  }
  if (fn) {
    const firstName = fn.trim().split(" ")[0].toLowerCase();
    userData.fn = sha256(firstName);
    // Last name if available
    const parts = fn.trim().split(" ");
    if (parts.length > 1) {
      userData.ln = sha256(parts[parts.length - 1].toLowerCase());
    }
  }

  const payload = {
    data: [
      {
        event_name,
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
    console.log(`CAPI ${event_name} response:`, JSON.stringify(data));
    return res.status(200).json(data);
  } catch (err) {
    console.error("CAPI error:", err);
    return res.status(500).json({ error: "Failed to send CAPI event" });
  }
}
