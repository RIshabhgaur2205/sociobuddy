import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";

import FloatingAIChat from "./components/chat/FloatingAIChat";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import Conversation from "./pages/Conversation";
import Mentors from "./pages/Mentors";
import Communities from "./pages/Communities";
import CommunityChat from "./pages/CommunityChat";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import ContactUs from "./pages/ContactUs";
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
          <Sonner />
          
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/conversation/:matchId" element={<Conversation />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/community/:communityId" element={<CommunityChat />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/community-guidelines" element={<CommunityGuidelines />} />
              <Route path="/contact" element={<ContactUs />} />
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
