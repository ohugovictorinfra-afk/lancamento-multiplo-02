import type { VercelRequest, VercelResponse } from "@vercel/node";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const STORE_KEY = "funnel-tasks:codigo-escala-v3";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({
      error: "Vercel KV não configurado. Adicione um banco KV/Redis em Storage no painel do projeto na Vercel.",
    });
  }

  if (req.method === "GET") {
    try {
      const r = await fetch(`${KV_URL}/get/${STORE_KEY}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      });
      const data = await r.json();
      const tasks = data.result ? JSON.parse(data.result) : {};
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
      await fetch(`${KV_URL}/set/${STORE_KEY}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        body: JSON.stringify(tasks),
      });
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: "Falha ao salvar tarefas" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
