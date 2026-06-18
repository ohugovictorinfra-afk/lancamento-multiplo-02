import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTAButtonProps {
  label?: string;
  className?: string;
}

export const CHECKOUT_URL = "https://pay.onprofit.com.br/P5JlkAul?off=2M6zVD";

export default function CTAButton({
  label = "Garantir meu Ingresso | Lote 01",
  className = "",
}: CTAButtonProps) {
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
      <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
        {label}
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </a>
    </Button>
  );
}
