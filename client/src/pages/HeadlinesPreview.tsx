import { HEADLINES } from "@/lib/headlines";

export default function HeadlinesPreview() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">Preview de Headlines</h1>
          <p className="text-muted-foreground text-sm">
            {HEADLINES.length} variantes para teste. Clique em "Ver ao vivo" para visualizar no design real.
            A headline é escolhida aleatoriamente por sessão — ou força uma específica com{" "}
            <code className="bg-secondary px-1.5 py-0.5 rounded text-accent text-xs">/?headline=N</code>.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Quando o visitante clica no botão de compra, o parâmetro{" "}
            <code className="bg-secondary px-1.5 py-0.5 rounded text-accent text-xs">hv=N</code>{" "}
            é enviado ao checkout — assim você sabe qual headline gerou a conversão.
          </p>
        </div>

        <div className="space-y-5">
          {HEADLINES.map((h) => (
            <div
              key={h.id}
              className="border border-border rounded-xl bg-card overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-secondary/30">
                <span className="text-xs font-bold text-white bg-accent px-2.5 py-1 rounded-full">
                  #{h.id}
                </span>
                <span className="text-xs text-muted-foreground">{h.type}</span>
                <a
                  href={`/?headline=${h.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs font-semibold text-accent hover:underline"
                >
                  Ver ao vivo →
                </a>
              </div>

              <div className="px-5 py-5 bg-zinc-950">
                <p
                  className="text-2xl md:text-3xl font-bold text-white leading-[1.15] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {h.main}
                </p>
                <p
                  className="text-base md:text-lg text-accent font-semibold leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {h.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Esta página é apenas para revisão interna — não está linkada na LP.
        </p>
      </div>
    </div>
  );
}
