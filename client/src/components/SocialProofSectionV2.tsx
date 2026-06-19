import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const testimonials = [
  {
    name: "João Silva",
    role: "Empreendedor Digital",
    image: "https://manus-storage-prod.s3.amazonaws.com/lancamento-multiplo/depoimento-1.jpg",
    text: "Mudou completamente meu jeito de fazer lançamento. Agora tenho previsibilidade.",
  },
  {
    name: "Maria Santos",
    role: "Estrategista de Vendas",
    image: "https://manus-storage-prod.s3.amazonaws.com/lancamento-multiplo/depoimento-2.jpg",
    text: "O sistema funciona. Saí de R$0 para R$50k/mês em 3 meses.",
  },
  {
    name: "Carlos Oliveira",
    role: "Especialista em Tráfego",
    image: "https://manus-storage-prod.s3.amazonaws.com/lancamento-multiplo/depoimento-3.jpg",
    text: "Finalmente entendi como fazer lançamento sem depender de lives.",
  },
];

export default function SocialProofSectionV2() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTestimonial, setSelectedTestimonial] = useState<number | null>(
    null
  );

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section className="relative py-16 md:py-20 lg:py-24 bg-background overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <p className="text-xs font-bold text-accent uppercase tracking-[0.3em]">
            Quem já aplicou
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Veja o que dizem os alunos
          </h2>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl bg-card/60 border border-border p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-accent">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="text-lg md:text-xl text-foreground mb-6 leading-relaxed italic">
                  "{testimonials[currentIndex].text}"
                </p>
                <div>
                  <p className="font-bold text-foreground">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full border border-border hover:bg-card/60 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? "bg-accent w-8" : "bg-border"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-full border border-border hover:bg-card/60 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {testimonials.map((testimonial, i) => (
            <Dialog
              key={i}
              open={selectedTestimonial === i}
              onOpenChange={(open) =>
                setSelectedTestimonial(open ? i : null)
              }
            >
              <DialogContent className="max-w-2xl">
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-16 h-16 text-white" fill="white" />
                  </div>
                </div>
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
