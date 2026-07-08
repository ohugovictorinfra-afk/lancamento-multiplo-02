import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    event, // "formStarted" | "formCompleted"
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

  const N8N_WEBHOOK = "https://n8n.zionprodigital.app.w8hub.com.br/webhook/quiz-plx-event";
  const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  // MOMENTO 1: Form iniciado (n8n webhook)
  if (event === "formStarted") {
    try {
      const n8nPayload = {
        event: "formStarted",
        name: nome || "",
        company: "",
        phone: whatsapp || "",
        email: email || "",
      };

      console.log("Servidor (api/diagnostico): Enviando formStarted para n8n...");
      const n8nResponse = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      });

      console.log(`n8n formStarted response status: ${n8nResponse.status}`);
    } catch (err) {
      console.error("Erro ao disparar formStarted para n8n:", err);
    }

    return res.status(200).json({ success: true, message: "formStarted processed" });
  }

  // MOMENTO 2: Form finalizado (n8n + GHL + Sheets)
  if (event === "formCompleted") {
    // Formatar faturamento legível
    const fatLabel =
      faturamento === "sub10k" ? "Zero a R$ 10k (ainda estou começando)" :
      faturamento === "10k_50k" ? "R$ 10k a R$ 50k (tenho algo validado)" :
      faturamento === "50k_100k" ? "R$ 50k a R$ 100k (faturamento recorrente)" :
      faturamento === "over100k" ? "Acima de R$ 100k (estou em escala)" : faturamento;

    const dispLabel =
      disponibilidade_presencial === "sim" ? "Sim, tenho disponibilidade total" : "Não tenho disponibilidade / Tenho restrições";

    // A) Enviar para o n8n
    try {
      const answersArray = [
        {
          question: "Há quanto tempo você atua no mercado digital?",
          answer: tempo_mercado || "",
        },
        {
          question: "Qual é o seu faturamento médio mensal hoje?",
          answer: fatLabel || "",
        },
        {
          question: "Qual é o tamanho do seu time hoje?",
          answer: tamanho_time || "",
        },
        {
          question: "Qual é o seu maior gargalo hoje?",
          answer: maior_gargalo || "",
        },
        {
          question: "Por que você acredita que a sua empresa deve ser uma das 15 escolhidas para estar no escritório da PLX no dia 14/07?",
          answer: por_que_escolhido || "",
        },
        {
          question: "Você tem disponibilidade para estar presencialmente em Alphaville das 08h às 18h na data do evento?",
          answer: dispLabel || "",
        }
      ];

      const n8nCompletedPayload = {
        event: "formCompleted",
        name: nome || "",
        company: "",
        phone: whatsapp || "",
        email: email || "",
        answers: answersArray,
      };

      console.log("Servidor (api/diagnostico): Enviando formCompleted para n8n...");
      const n8nResponse = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nCompletedPayload),
      });

      console.log(`n8n formCompleted response status: ${n8nResponse.status}`);
    } catch (err) {
      console.error("Erro ao enviar formCompleted para n8n:", err);
    }

    // B) Enviar para o Google Sheets (se configurado)
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
        console.log("Google Sheets enviado com sucesso.");
      } catch (err) {
        console.error("Erro ao enviar para Google Sheets:", err);
      }
    }

    // C) Enviar para o GoHighLevel (se a API Key estiver configurada)
    const GHL_KEY = process.env.GHL_API_KEY;
    if (GHL_KEY) {
      try {
        let formattedPhone = whatsapp ? whatsapp.replace(/\D/g, "") : "";
        if (formattedPhone) {
          if (!formattedPhone.startsWith("55") && formattedPhone.length >= 10) {
            formattedPhone = "55" + formattedPhone;
          }
          formattedPhone = "+" + formattedPhone;
        }

        const ghlHeaders = {
          "Authorization": `Bearer ${GHL_KEY}`,
          "Version": "2021-07-28",
          "Content-Type": "application/json",
        };

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

        if (ghlResponse.ok) {
          const ghlData = await ghlResponse.json();
          const contactId = ghlData?.contact?.id;

          if (contactId) {
            const notePayload = {
              body: `Respostas da Aplicação 'O Bastidor do Bastidor' (${timestamp}):\n\n` +
                    `- Tempo de Mercado Digital: ${tempo_mercado}\n` +
                    `- Faturamento Mensal: ${fatLabel}\n` +
                    `- Tamanho do Time: ${tamanho_time}\n` +
                    `- Maior Gargalo: ${maior_gargalo}\n` +
                    `- Por que deve ser um dos 15 escolhidos: ${por_que_escolhido}\n` +
                    `- Tem disponibilidade presencial em Alphaville no dia 14/07: ${dispLabel}`,
            };

            await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
              method: "POST",
              headers: ghlHeaders,
              body: JSON.stringify(notePayload),
            });
            console.log("Nota salva no GHL com sucesso.");
          }
        }
      } catch (err) {
        console.error("Erro no GHL:", err);
      }
    }

    return res.status(200).json({ success: true, message: "formCompleted processed" });
  }

  return res.status(400).json({ error: "Invalid event type" });
}
