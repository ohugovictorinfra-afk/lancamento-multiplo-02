# Contexto do projeto — lancamento-multiplo-02

SPA em React + Vite + wouter com várias landing pages (Código da Escala, Casa do
Luiz, upsells, obrigado, cadastro, etc.), todas roteadas no client. Deploy na
Vercel como app estático (`vercel.json` reescreve tudo pra `index.html`).

## Regra obrigatória: toda página nova precisa de meta tags próprias

Como é um SPA client-side com um único `index.html`, todas as rotas compartilham
por padrão o mesmo `<title>`, `description` e `og:image` — sem correção manual,
qualquer link compartilhado (WhatsApp, Facebook, Twitter) mostra sempre a mesma
prévia genérica, não importa qual página real seja. Isso já foi bug real uma vez
(o link do `/casa-do-luiz` aparecia com título/imagem do Código da Escala).

A correção vive em [`middleware.ts`](middleware.ts) (Vercel Edge Middleware, roda
antes do rewrite pro `index.html` e reescreve as meta tags por rota). **Ao criar
qualquer página/rota nova:**

1. Adicionar a rota em `client/src/App.tsx`, como sempre.
2. Adicionar uma entrada em `ROUTE_META` dentro de `middleware.ts` com:
   - `title` — próprio da página, nunca copiado de outra rota.
   - `description` — 1-2 frases específicas do que aquela página oferece.
   - `image` — se a página tiver uma imagem de destaque própria em
     `client/public/assets/`, usar ela; usar `BOT8_FALLBACK` só se a página não
     tiver nenhum asset visual próprio.
3. Não precisa mexer em mais nada — o middleware cuida do `<title>` da aba e da
   prévia de link automaticamente.

**Importante:** o Edge Middleware só roda na infraestrutura da Vercel de verdade
— não é possível testar via `vite dev`/preview local. Pra validar uma mudança
nele, ou usar `vercel dev` (CLI da Vercel), ou conferir depois do deploy (Vercel
gera preview URL a cada push, e o preview de link pode ser testado colando a URL
num chat/rede social).
