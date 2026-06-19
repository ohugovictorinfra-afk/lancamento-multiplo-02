import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  { src: "/manus-storage/depoimento-1_b4519ab9.jpg", alt: "Depoimento — Arthur Santos, R$ 182.700" },
  { src: "/manus-storage/depoimento-2_97cac983.jpg", alt: "Depoimento — Lucas Miike, R$ 1.039.797" },
  { src: "/manus-storage/depoimento-3_9a4f9360.jpg", alt: "Depoimento — Dr. Décio, primeira mentoria de 36k" },
  { src: "/manus-storage/depoimento-4_3fb91a86.jpg", alt: "Depoimento — Elaine Magari, 300k em vendas" },
  { src: "/manus-storage/depoimento-5_b528055d.png", alt: "Depoimento — Carlos Garcia, quarta venda em abril" },
];

export default function SocialProofSectionV2() {
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
                    className="relative group overflow-hidden rounded-xl"
                  >
                    <img
                      src={t.src}
                      alt={t.alt}
                      className="w-full h-auto rounded-xl transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 p-2 rounded-full border border-border hover:bg-card/60 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 p-2 rounded-full border border-border hover:bg-card/60 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {testimonials.map((t, i) => (
            <Dialog
              key={i}
              open={expanded === t.src}
              onOpenChange={(open) => setExpanded(open ? t.src : null)}
            >
              <DialogContent className="max-w-4xl">
                <img src={t.src} alt={t.alt} className="w-full h-auto rounded-lg" />
              </DialogContent>
            </Dialog>
          ))}
        </div>

        <div className="flex justify-center mt-14">
          <a
            href="https://pay.onprofit.com.br/P5JlkAul?off=2M6zVD"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent hover:bg-accent/90 text-white font-bold text-base md:text-lg h-14 px-8 rounded-lg group relative overflow-hidden w-fit inline-flex items-center justify-center"
            style={{
              boxShadow:
                "0 0 30px rgba(255, 68, 68, 0.6), 0 0 60px rgba(255, 68, 68, 0.3)",
              fontFamily: "var(--font-body)",
            }}
          >
            Quero estar na próxima turma
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
