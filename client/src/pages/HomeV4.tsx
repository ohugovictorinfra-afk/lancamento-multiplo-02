import HeroSectionV4 from "@/components/HeroSectionV4";
import WhatYouLearnSectionV4 from "@/components/WhatYouLearnSectionV4";
import ForWhomSection from "@/components/ForWhomSection";
import ComparisonSectionV4 from "@/components/ComparisonSectionV4";
import SocialProofSectionV4 from "@/components/SocialProofSectionV4";
import ObjectionsSection from "@/components/ObjectionsSection";
import FinalCTASectionV4 from "@/components/FinalCTASectionV4";
import LiveClassSection from "@/components/LiveClassSection";
import AboutLuizSection, { FAQSection } from "@/components/AboutLuizSection";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

export default function HomeV4() {
  useFacebookPixel();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSectionV4 />
      <WhatYouLearnSectionV4 />
      <ForWhomSection />
      <ObjectionsSection />
      <ComparisonSectionV4 />
      <LiveClassSection />
      <AboutLuizSection />
      <SocialProofSectionV4 />
      <FinalCTASectionV4 />
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
