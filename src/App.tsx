import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import SavedPosts from "./pages/SavedPosts.tsx";
import History from "./pages/History.tsx";
import BrandKit from "./pages/BrandKit.tsx";
import Shops from "./pages/Shops.tsx";
import Schedule from "./pages/Schedule.tsx";
import Analytics from "./pages/Analytics.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/saved" element={<SavedPosts />} />
            <Route path="/history" element={<History />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/brand-kit" element={<BrandKit />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/onboarding" element={<Onboarding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
