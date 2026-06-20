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
