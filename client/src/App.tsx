import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useUtmTracking } from "./hooks/useUtmTracking";

const Home = lazy(() => import("./pages/Home"));
const HomeV2 = lazy(() => import("./pages/HomeV2"));
const HomeV3 = lazy(() => import("./pages/HomeV3"));
const HomeV4 = lazy(() => import("./pages/HomeV4"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const HeadlinesPreview = lazy(() => import("./pages/HeadlinesPreview"));
const Upsell1 = lazy(() => import("./pages/Upsell1"));
const Upsell2 = lazy(() => import("./pages/Upsell2"));
const CodigoEscala = lazy(() => import("./pages/CodigoEscala"));
const CodigoEscalaV2 = lazy(() => import("./pages/CodigoEscalaV2"));
const CodigoEscalaV3 = lazy(() => import("./pages/CodigoEscalaV3"));
const UpsellDiamond = lazy(() => import("./pages/UpsellDiamond"));
const ThankYouPadrao = lazy(() => import("./pages/ThankYouPadrao"));
const ThankYouDiamond = lazy(() => import("./pages/ThankYouDiamond"));
const CadastroPadrao = lazy(() => import("./pages/CadastroPadrao"));
const CadastroDiamond = lazy(() => import("./pages/CadastroDiamond"));
const Funnels = lazy(() => import("./pages/Funnels"));
const NotFound = lazy(() => import("./pages/NotFound"));


function Router() {
  useUtmTracking();
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/v2"} component={HomeV2} />
        <Route path={"/v3"} component={HomeV3} />
        <Route path={"/v4"} component={HomeV4} />
        <Route path={"/obrigado"} component={ThankYou} />
        <Route path={"/headlines-preview"} component={HeadlinesPreview} />
        <Route path={"/upsell-1"} component={Upsell1} />
        <Route path={"/upsell-2"} component={Upsell2} />
        <Route path={"/codigo-escala"} component={CodigoEscala} />
        <Route path={"/codigo-escala-v2"} component={CodigoEscalaV2} />
        <Route path={"/codigo-escala-v3"} component={CodigoEscalaV3} />
        <Route path={"/diamond"} component={UpsellDiamond} />
        <Route path={"/obrigado-padrao"} component={ThankYouPadrao} />
        <Route path={"/obrigado-diamond"} component={ThankYouDiamond} />
        <Route path={"/cadastro-padrao"} component={CadastroPadrao} />
        <Route path={"/cadastro-diamond"} component={CadastroDiamond} />
        <Route path={"/funis"} component={Funnels} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
