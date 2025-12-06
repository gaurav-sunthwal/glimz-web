import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Signup from "./pages/auth/Signup";
import CreatorSignup from "./pages/auth/CreatorSignup";
import UserSignup from "./pages/auth/UserSignup";
import OtpVerification from "./pages/auth/OtpVerification";
import MobileEntry from "./pages/auth/MobileEntry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/creator" element={<CreatorSignup />} />
          <Route path="/signup/user" element={<UserSignup />} />
          <Route path="/signup/otp" element={<OtpVerification />} />
          <Route path="/signup/mobile/:userType" element={<MobileEntry />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
