import HeroSectionV3 from "@/components/HeroSectionV3";
import WhatYouLearnSectionV3 from "@/components/WhatYouLearnSectionV3";
import ForWhomSection from "@/components/ForWhomSection";
import ComparisonSectionV3 from "@/components/ComparisonSectionV3";
import SocialProofSectionV3 from "@/components/SocialProofSectionV3";
import ObjectionsSection from "@/components/ObjectionsSection";
import FinalCTASectionV3 from "@/components/FinalCTASectionV3";
import LiveClassSection from "@/components/LiveClassSection";
import AboutLuizSection, { FAQSection } from "@/components/AboutLuizSection";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

export default function HomeV3() {
  useFacebookPixel();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSectionV3 />
      <WhatYouLearnSectionV3 />
      <ForWhomSection />
      <ObjectionsSection />
      <ComparisonSectionV3 />
      <LiveClassSection />
      <AboutLuizSection />
      <SocialProofSectionV3 />
      <FinalCTASectionV3 />
      <FAQSection />

      <footer className="relative bg-secondary/30 border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            © 2026 Luiz Filho — O Novo Jogo dos Lançamentos. Todos os direitos reservados.
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-accent transition-colors">Política de Privacidade</a>
            <span className="text-border">•</span>
            <a href="#" className="hover:text-accent transition-colors">Termos de Uso</a>
            <span className="text-border">•</span>
            <a href="#" className="hover:text-accent transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
