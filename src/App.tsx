import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationPrompt } from "./components/notifications/NotificationPrompt";
import FloatingAIChat from "./components/chat/FloatingAIChat";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import Conversation from "./pages/Conversation";
import Mentors from "./pages/Mentors";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import AdminMentors from "./pages/AdminMentors";
import AdminUsers from "./pages/AdminUsers";
import AdminReferralCodes from "./pages/AdminReferralCodes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationPrompt />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/conversation/:matchId" element={<Conversation />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin/mentors" element={<AdminMentors />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/referral-codes" element={<AdminReferralCodes />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingAIChat />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
