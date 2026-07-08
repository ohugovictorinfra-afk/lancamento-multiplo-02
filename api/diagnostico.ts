import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    nome,
    email,
    whatsapp,
    tempo_mercado,
    faturamento,
    tamanho_time,
    maior_gargalo,
    por_que_escolhido,
    disponibilidade_presencial,
  } = req.body ?? {};

  // Formatar telefone para padrão internacional E.164 (+55...) se for BR
  let formattedPhone = whatsapp ? whatsapp.replace(/\D/g, "") : "";
  if (formattedPhone) {
    if (!formattedPhone.startsWith("55") && formattedPhone.length >= 10) {
      formattedPhone = "55" + formattedPhone;
    }
    formattedPhone = "+" + formattedPhone;
  }

  const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  // 1. Enviar para o Google Sheets (se configurado)
  const SHEETS_WEBHOOK = process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
  if (SHEETS_WEBHOOK) {
    try {
      const sheetsPayload = {
        data_envio: timestamp,
        nome,
        email,
        whatsapp,
        tempo_mercado,
        faturamento,
        tamanho_time,
        maior_gargalo,
        por_que_escolhido,
        disponibilidade_presencial,
      };

      await fetch(SHEETS_WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetsPayload),
      });
      console.log("Dados enviados para o Google Sheets com sucesso.");
    } catch (err) {
      console.error("Erro ao enviar para o Google Sheets:", err);
    }
  }

  // 2. Enviar para o GoHighLevel (se a API Key estiver configurada)
  const GHL_KEY = process.env.GHL_API_KEY;
  if (GHL_KEY) {
    try {
      const ghlHeaders = {
        "Authorization": `Bearer ${GHL_KEY}`,
        "Version": "2021-07-28",
        "Content-Type": "application/json",
      };

      // Faturamento formatado legível para GHL tags/fields
      const fatLabel =
        faturamento === "sub10k" ? "Zero a R$ 10k" :
        faturamento === "10k_50k" ? "R$ 10k a R$ 50k" :
        faturamento === "50k_100k" ? "R$ 50k a R$ 100k" :
        faturamento === "over100k" ? "Acima de R$ 100k" : faturamento;

      const ghlPayload = {
        name: nome,
        email: email,
        phone: formattedPhone || undefined,
        tags: ["Bastidor do Bastidor", "Aplicação Presencial", `Faturamento: ${fatLabel}`],
      };

      console.log("Upserting contact in GHL...");
      const ghlResponse = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
        method: "POST",
        headers: ghlHeaders,
        body: JSON.stringify(ghlPayload),
      });

      if (!ghlResponse.ok) {
        const errorText = await ghlResponse.text();
        throw new Error(`GHL Upsert Failed: ${ghlResponse.status} - ${errorText}`);
      }

      const ghlData = await ghlResponse.json();
      const contactId = ghlData?.contact?.id;

      if (contactId) {
        console.log(`Contact created/updated in GHL (ID: ${contactId}). Creating note...`);

        // Adicionar as respostas detalhadas como nota do contato
        const notePayload = {
          body: `Respostas da Aplicação 'O Bastidor do Bastidor' (${timestamp}):\n\n` +
                `- Tempo de Mercado Digital: ${tempo_mercado}\n` +
                `- Faturamento Mensal: ${fatLabel}\n` +
                `- Tamanho do Time: ${tamanho_time}\n` +
                `- Maior Gargalo: ${maior_gargalo}\n` +
                `- Por que deve ser um dos 15 escolhidos: ${por_que_escolhido}\n` +
                `- Tem disponibilidade presencial em Alphaville no dia 14/07: ${disponibilidade_presencial === "sim" ? "Sim" : "Não"}`,
        };

        const noteResponse = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
          method: "POST",
          headers: ghlHeaders,
          body: JSON.stringify(notePayload),
        });

        if (!noteResponse.ok) {
          console.error("Erro ao salvar nota no GHL:", await noteResponse.text());
        } else {
          console.log("Nota salva no GHL com sucesso.");
        }
      }
    } catch (err) {
      console.error("Erro na integração com GoHighLevel:", err);
    }
  } else {
    console.log("Integração com GHL ignorada: GHL_API_KEY não configurada no ambiente.");
  }

  return res.status(200).json({ success: true });
}
