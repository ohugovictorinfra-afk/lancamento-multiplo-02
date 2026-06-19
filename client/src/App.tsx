import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home"));
const HomeV2 = lazy(() => import("./pages/HomeV2"));
const HomeV3 = lazy(() => import("./pages/HomeV3"));
const HomeV4 = lazy(() => import("./pages/HomeV4"));
const ThankYou = lazy(() => import("./pages/ThankYou"));


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/v2"} component={HomeV2} />
      <Route path={"/v3"} component={HomeV3} />
      <Route path={"/v4"} component={HomeV4} />
      <Route path={"/obrigado"} component={ThankYou} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
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
          <Suspense fallback={null}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
