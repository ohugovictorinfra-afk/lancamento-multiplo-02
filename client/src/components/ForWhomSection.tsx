import { Check, X } from "lucide-react";

const forYou = [
  "Já faz lançamentos, mas vive na montanha-russa financeira (um mês bom, outro ruim)",
  "Sente que o seu negócio só funciona se você ficar 24h fazendo stories e lives",
  "Tem uma lista de leads parada e não sabe como extrair dinheiro dela todos os dias",
  "Já ouviu falar de Funis de Entrada, mas não entende a lógica técnica por trás da conversão",
  "Quer parar de ser um \"trabalhador da própria empresa\" e virar um empresário do digital",
];

const notForYou = [
  "Está procurando fórmula mágica para ficar rico sem investir um real em tráfego",
  "Acredita que basta postar no orgânico para escalar um negócio de milhões",
  "Quer ser um \"estudante profissional\" que compra curso mas não executa nada",
  "Não tem um produto ou um conhecimento que realmente gera valor para as pessoas",
];

export default function ForWhomSection() {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-card/60 border border-border rounded-xl p-6 md:p-8 border-t-4 border-t-emerald-500">
            <h3
              className="text-xl md:text-2xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Esta aula é pra você que:
            </h3>
            <ul className="space-y-4">
              {forYou.map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                  </span>
                  <span className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card/60 border border-border rounded-xl p-6 md:p-8 border-t-4 border-t-accent">
            <h3
              className="text-xl md:text-2xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              E NÃO é pra você que:
            </h3>
            <ul className="space-y-4">
              {notForYou.map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 border border-accent flex items-center justify-center mt-0.5">
                    <X className="w-3 h-3 text-accent" strokeWidth={3} />
                  </span>
                  <span className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
