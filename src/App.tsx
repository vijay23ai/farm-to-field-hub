import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import CropAdvisor from "./pages/CropAdvisor";
import DiseaseDetection from "./pages/DiseaseDetection";
import MarketInsights from "./pages/MarketInsights";
import Community from "./pages/Community";
import AskAI from "./pages/AskAI";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Robo from "./pages/Robo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ask-ai" element={<AskAI />} />
            <Route path="/robo" element={<Robo />} />
            <Route path="/crop-advisor" element={<CropAdvisor />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            <Route path="/market-insights" element={<MarketInsights />} />
            <Route path="/community" element={<Community />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
