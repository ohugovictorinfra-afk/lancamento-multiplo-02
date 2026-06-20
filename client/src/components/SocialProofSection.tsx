import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CTAButtonV1 from "./CTAButtonV1";

const testimonials = [
  { src: "/images/depoimento-1_b4519ab9.webp", alt: "Depoimento — Arthur Santos, R$ 182.700" },
  { src: "/images/depoimento-2_97cac983.webp", alt: "Depoimento — Lucas Miike, R$ 1.039.797" },
  { src: "/images/depoimento-3_9a4f9360.webp", alt: "Depoimento — Dr. Décio, primeira mentoria de 36k" },
  { src: "/images/depoimento-4_3fb91a86.webp", alt: "Depoimento — Elaine Magari, 300k em vendas" },
  { src: "/images/depoimento-5_b528055d.webp", alt: "Depoimento — Carlos Garcia, quarta venda em abril" },
];

export default function SocialProofSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })],
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-transparent to-secondary/10" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quem já entrou no jogo sabe
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Especialistas que aplicaram esse sistema e transformaram seus negócios
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="flex-[0_0_85%] sm:flex-[0_0_55%] md:flex-[0_0_38%] lg:flex-[0_0_28%] min-w-0 px-3"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(t.src)}
                    className="block w-full rounded-xl overflow-hidden border border-border bg-card hover:border-accent/60 transition-all duration-300 group"
                    aria-label={`Expandir ${t.alt}`}
                  >
                    <img
                      src={t.src}
                      alt={t.alt}
                      loading="lazy"
                      className="w-full h-[380px] md:h-[440px] object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-background/80 border border-border items-center justify-center hover:bg-accent hover:text-white transition-colors backdrop-blur-sm flex"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-background/80 border border-border items-center justify-center hover:bg-accent hover:text-white transition-colors backdrop-blur-sm flex"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <Dialog open={!!expanded} onOpenChange={(o) => !o && setExpanded(null)}>
          <DialogContent className="max-w-3xl p-0 bg-transparent border-0 shadow-none">
            {expanded && (
              <img
                src={expanded}
                alt="Depoimento ampliado"
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>

        <div className="flex justify-center mt-14">
          <CTAButtonV1 label="Quero estar na próxima turma" />
        </div>
      </div>
    </section>
  );
}
