import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Showroom from "./pages/Showroom";
import ProjectComments from "./pages/ProjectComments";
import AddProject from "./pages/AddProject";
import Leaderboard from "./pages/Leaderboard";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import HowItWorks from "./pages/HowItWorks";
import ComingSoon from "./pages/ComingSoon";

const queryClient = new QueryClient();

// Route wrapper that conditionally shows coming soon or actual routes
const AppRoutes = () => {
  const [searchParams] = useSearchParams();
  const [isComingSoon, setIsComingSoon] = useState<boolean | null>(null);
  
  const previewMode = searchParams.get("preview") === "true";
  
  useEffect(() => {
    // Runtime'da environment variable'ı kontrol et
    const comingSoonValue = import.meta.env.VITE_COMING_SOON_MODE;
    console.log("VITE_COMING_SOON_MODE:", comingSoonValue);
    console.log("VITE_COMING_SOON_MODE type:", typeof comingSoonValue);
    
    // Farklı formatları kontrol et: "true", true, "1", 1
    const isEnabled = 
      comingSoonValue === "true" || 
      comingSoonValue === true ||
      comingSoonValue === "1" ||
      comingSoonValue === 1;
    
    setIsComingSoon(isEnabled);
  }, []);

  // Loading state - henüz kontrol edilmedi
  if (isComingSoon === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#a3e635] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show coming soon if:
  // - Coming soon mode is enabled AND
  // - Not in preview mode
  const showComingSoon = isComingSoon && !previewMode;

  if (showComingSoon) {
    return (
      <Routes>
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/showroom" element={<Showroom />} />
      <Route path="/project/:id/comments" element={<ProjectComments />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/add-project" element={<AddProject />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
