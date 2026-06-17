import HeroSection from "@/components/HeroSection";
import WhatYouLearnSection from "@/components/WhatYouLearnSection";
import ForWhomSection from "@/components/ForWhomSection";
import ComparisonSection from "@/components/ComparisonSection";
import SocialProofSection from "@/components/SocialProofSection";
import ObjectionsSection from "@/components/ObjectionsSection";
import FinalCTASection from "@/components/FinalCTASection";
import LiveClassSection from "@/components/LiveClassSection";
import AboutLuizSection, { FAQSection } from "@/components/AboutLuizSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <WhatYouLearnSection />
      <ForWhomSection />
      <ObjectionsSection />
      <ComparisonSection />
      <LiveClassSection />
      <AboutLuizSection />
      <SocialProofSection />
      <FinalCTASection />
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
