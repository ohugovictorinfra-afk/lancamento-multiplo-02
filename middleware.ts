// Vercel Edge Middleware — injeta <title>/description/og/twitter únicos por rota.
//
// Por quê isso existe: o app é uma SPA (Vite + wouter), todas as rotas servem o
// MESMO client/index.html (ver rewrites em vercel.json). Sem isso, qualquer link
// compartilhado (WhatsApp, Facebook, Twitter) mostra sempre o título/descrição/
// imagem do Código da Escala, não importa qual página real for — porque bots de
// preview de link não executam JS, só leem o HTML estático que o servidor devolve.
//
// PROCESSO — ao criar uma página nova:
//   1. Adicionar a rota em client/src/App.tsx (como sempre).
//   2. Adicionar uma entrada em ROUTE_META abaixo com title/description/image
//      PRÓPRIOS da página (nunca copiar de outra rota). Se a página tiver uma
//      imagem de destaque própria em client/public/assets/, usar ela; senão,
//      usar BOT8_FALLBACK só como último recurso.
//   3. Pronto — o middleware cuida do resto (título da aba, preview de link).

export const config = {
  matcher: ["/((?!api/|assets/|.*\\..*).*)"],
};

type Meta = { title: string; description: string; image: string };

const SITE = "https://lp.luizfilho.com";
const BOT8_FALLBACK = `${SITE}/assets/bot8.webp`;

const ROUTE_META: Record<string, Meta> = {
  "/": {
    title: "O Novo Jogo dos Lançamentos — Treinamento com Luiz Filho",
    description: "O sistema que Luiz Filho usou para operar 128+ lançamentos e gerar R$300M em vendas. Aprenda a estrutura completa num treinamento ao vivo.",
    image: BOT8_FALLBACK,
  },
  "/v2": {
    title: "O Novo Jogo dos Lançamentos — Turma 2026 | Luiz Filho",
    description: "O sistema que Luiz Filho usou para operar 128+ lançamentos e gerar R$300M em vendas. Garanta sua vaga na próxima turma.",
    image: BOT8_FALLBACK,
  },
  "/v3": {
    title: "Lucro por Lead Desde o Dia 1 do Lançamento | Luiz Filho",
    description: "Rode gravações que você já tem, com aquisição a custo zero, sem gravar uma única live nova. O método por trás de 128+ lançamentos.",
    image: BOT8_FALLBACK,
  },
  "/v4": {
    title: "O Sistema Por Trás de R$300M em Lançamentos | Luiz Filho",
    description: "Como chegar no dia do lançamento já no lucro por lead, rodando gravações que você já tem, com aquisição a custo zero.",
    image: BOT8_FALLBACK,
  },
  "/obrigado": {
    title: "Inscrição Confirmada — Treinamento Lançamento Múltiplo",
    description: "Você garantiu sua vaga no Treinamento Lançamento Múltiplo. Confira os próximos passos e entre no grupo do WhatsApp.",
    image: BOT8_FALLBACK,
  },
  "/headlines-preview": {
    title: "Preview de Headlines — Ferramenta Interna",
    description: "Ferramenta interna para visualizar variantes de headline do funil antes de publicar. Não é uma página pública.",
    image: BOT8_FALLBACK,
  },
  "/upsell-1": {
    title: "Upgrade VIP — Treinamento Lançamento Múltiplo",
    description: "Antes de acessar seu treinamento: desbloqueie bônus exclusivos e mentoria com o upgrade VIP.",
    image: BOT8_FALLBACK,
  },
  "/upsell-2": {
    title: "Ingresso Black — Últimas Vagas | Lançamento Múltiplo",
    description: "Compare Standard, VIP e Black e desbloqueie todos os bônus exclusivos antes que as vagas acabem.",
    image: BOT8_FALLBACK,
  },
  "/codigo-escala": {
    title: "Código da Escala — Evento Presencial com Luiz Filho",
    description: "O sistema que Luiz Filho usou para operar 128+ lançamentos e gerar R$300M em vendas. 2 dias presenciais em Alphaville, São Paulo.",
    image: BOT8_FALLBACK,
  },
  "/codigo-escala-v2": {
    title: "Código da Escala — 22 e 23 de Julho | Alphaville, SP",
    description: "O sistema que Luiz Filho usou para operar 128+ lançamentos e gerar R$300M em vendas. 2 dias presenciais em Alphaville, São Paulo.",
    image: BOT8_FALLBACK,
  },
  "/codigo-escala-v3": {
    title: "Código da Escala — Alphaville, SP | 22 e 23 de Julho de 2026",
    description: "O sistema que Luiz Filho usou para operar 128+ lançamentos e gerar R$300M em vendas. 2 dias presenciais em Alphaville, São Paulo.",
    image: BOT8_FALLBACK,
  },
  "/diamond": {
    title: "Ingresso Diamond — Upgrade Exclusivo | Código da Escala",
    description: "Agora você tem acesso VIP ao treinamento. Veja o que está incluído no Ingresso Diamond antes de decidir.",
    image: BOT8_FALLBACK,
  },
  "/obrigado-padrao": {
    title: "Ingresso Confirmado — Código da Escala",
    description: "Sua vaga no Código da Escala está garantida. Confira os detalhes do evento em Alphaville, SP.",
    image: BOT8_FALLBACK,
  },
  "/obrigado-diamond": {
    title: "Bem-vindo à Experiência — Código da Escala",
    description: "Ingresso confirmado. Prepare-se para uma experiência exclusiva em Alphaville, SP, nos dias 22 e 23 de Julho de 2026.",
    image: BOT8_FALLBACK,
  },
  "/cadastro-padrao": {
    title: "Complete seu Cadastro — Código da Escala",
    description: "Faltam poucos passos para confirmar sua presença no Código da Escala, em Alphaville, SP.",
    image: BOT8_FALLBACK,
  },
  "/cadastro-diamond": {
    title: "Complete seu Cadastro — Ingresso Diamond",
    description: "Faltam poucos passos para confirmar sua presença no Ingresso Diamond, incluindo o jantar exclusivo em Alphaville, SP.",
    image: BOT8_FALLBACK,
  },
  "/funis": {
    title: "Mapa de Funil — Ferramenta Interna",
    description: "Visualização interna do funil de vendas e automações. Não é uma página pública.",
    image: BOT8_FALLBACK,
  },
  "/funis-automacao": {
    title: "Mapa de Funil (Rascunho) — Ferramenta Interna",
    description: "Protótipo interno de mapa de funil com foco em automações. Não é uma página pública.",
    image: BOT8_FALLBACK,
  },
  "/copy": {
    title: "Copy System — Dashboard Interno",
    description: "Ferramenta interna para gerenciar anúncios com Hook, Corpo, CTA e status de gravação. Não é uma página pública.",
    image: BOT8_FALLBACK,
  },
  "/casa-do-luiz": {
    title: "Um Jantar na Casa do Luiz Filho — Tamboré 2, Alphaville",
    description: "Uma noite íntima e exclusiva à mesa com Luiz Filho, em Tamboré 2, Alphaville, no dia 22 de Julho de 2026. Vagas ultralimitadas.",
    image: `${SITE}/assets/jantar_ambiente.webp`,
  },
  "/bastidor": {
    title: "O Bastidor do Bastidor — Aplicação com Luiz Filho",
    description: "No dia 14 de julho, Luiz Filho vai abrir as portas do escritório para apenas 15 empresas. Verifique os bastidores, responda ao formulário e candidate-se.",
    image: BOT8_FALLBACK,
  },
  "/404": {
    title: "Página Não Encontrada",
    description: "A página que você procura não existe ou foi movida.",
    image: BOT8_FALLBACK,
  },
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const meta = ROUTE_META[url.pathname];
  if (!meta) return; // rota sem entrada própria — deixa passar sem modificar

  const origin = await fetch(new URL("/index.html", url.origin));
  let html = await origin.text();

  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const pageUrl = escapeHtml(`${SITE}${url.pathname}`);

  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${pageUrl}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
