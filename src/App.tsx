
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
    keyfacial: false,
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
        
        if (status.error) {
          toast({
            title: "Model Loading Error",
            description: status.error,
            variant: "destructive",
          });
        } else if (status.keyfacial && status.facialEmotion && status.speechEmotion) {
          toast({
            title: "Models Loaded",
            description: "All required models have been loaded successfully.",
          });
        } else {
          toast({
            title: "Missing Models",
            description: "Some models could not be loaded. Please check the model directory.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to initialize models:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize emotion analysis models.",
          variant: "destructive",
        });
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
