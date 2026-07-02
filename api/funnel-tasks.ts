import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;
const STORE_KEY = "funnel-tasks:codigo-escala-v3";

// Reutiliza a conexão entre invocações "quentes" da function — evita reconectar a cada request.
let client: ReturnType<typeof createClient> | null = null;
let connecting: Promise<void> | null = null;

async function getClient() {
  if (!client) {
    client = createClient({ url: REDIS_URL });
    client.on("error", err => console.error("Redis error", err));
  }
  if (!client.isOpen) {
    if (!connecting) {
      connecting = client.connect().then(() => undefined).finally(() => { connecting = null; });
    }
    await connecting;
  }
  return client;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!REDIS_URL) {
    return res.status(500).json({
      error: "REDIS_URL não configurado. Conecte o banco Redis ao projeto na aba Storage da Vercel.",
    });
  }

  if (req.method === "GET") {
    try {
      const redis = await getClient();
      const raw = await redis.get(STORE_KEY);
      const tasks = typeof raw === "string" ? JSON.parse(raw) : {};
      return res.status(200).json({ tasks });
    } catch {
      return res.status(500).json({ error: "Falha ao ler tarefas" });
    }
  }

  if (req.method === "PUT") {
    const { tasks } = req.body ?? {};
    if (!tasks || typeof tasks !== "object") {
      return res.status(400).json({ error: "tasks é obrigatório" });
    }
    try {
      const redis = await getClient();
      await redis.set(STORE_KEY, JSON.stringify(tasks));
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: "Falha ao salvar tarefas" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
