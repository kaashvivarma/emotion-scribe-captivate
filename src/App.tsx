
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { loadModels, ModelLoadingStatus } from "@/utils/modelLoader";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [modelStatus, setModelStatus] = useState<ModelLoadingStatus>({
    facialEmotion: false,
    speechEmotion: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const initModels = async () => {
      try {
        const status = await loadModels();
        setModelStatus(status);
        
        // Only show success message if models loaded successfully
        // Don't show error messages to avoid confusing users
        if (status.facialEmotion && status.speechEmotion) {
          toast({
            title: "Ready to analyze emotions",
            description: "You can now capture images and record audio for analysis.",
          });
        }
      } catch (error) {
        console.error("Failed to initialize models:", error);
        // Don't show error toast
      }
    };

    initModels();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
