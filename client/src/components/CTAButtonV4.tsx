import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTAButtonV4Props {
  label?: string;
  className?: string;
}

export const CHECKOUT_URL_V4 = "https://pay.onprofit.com.br/P5JlkAul?off=NHSS77";

export default function CTAButtonV4({
  label = "Garantir meu Ingresso | Lote 01",
  className = "",
}: CTAButtonV4Props) {
  return (
    <Button
      asChild
      size="lg"
      className={`bg-accent hover:bg-accent/90 text-white font-bold text-base md:text-lg h-14 px-8 rounded-lg group relative overflow-hidden w-fit ${className}`}
      style={{
        boxShadow:
          "0 0 30px rgba(255, 68, 68, 0.6), 0 0 60px rgba(255, 68, 68, 0.3)",
        fontFamily: "var(--font-body)",
      }}
    >
      <a href={CHECKOUT_URL_V4} target="_blank" rel="noopener noreferrer">
        {label}
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </a>
    </Button>
  );
}
