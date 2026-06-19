import HeroSectionV2 from "@/components/HeroSectionV2";
import WhatYouLearnSection from "@/components/WhatYouLearnSection";
import ForWhomSection from "@/components/ForWhomSection";
import ComparisonSectionV2 from "@/components/ComparisonSectionV2";
import SocialProofSectionV2 from "@/components/SocialProofSectionV2";
import ObjectionsSection from "@/components/ObjectionsSection";
import FinalCTASectionV2 from "@/components/FinalCTASectionV2";
import LiveClassSection from "@/components/LiveClassSection";
import AboutLuizSection, { FAQSection } from "@/components/AboutLuizSection";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

export default function HomeV2() {
  useFacebookPixel();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSectionV2 />
      <WhatYouLearnSection />
      <ForWhomSection />
      <ObjectionsSection />
      <ComparisonSectionV2 />
      <LiveClassSection />
      <AboutLuizSection />
      <SocialProofSectionV2 />
      <FinalCTASectionV2 />
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
