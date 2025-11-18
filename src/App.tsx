import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage"; 
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { ProfilePage } from "./components/ProfilePage";
import { TeamsPage } from "./components/TeamsPage";
import { MessagesPage } from "./components/MessagesPage";
import { AuthProvider } from "./contexts/AuthContext";
import EventsPage from "./components/Events"; // ✅ fixed import
import NotFound from "./pages/NotFound";
import RegistrationPage from "./components/Registration"
import TeamRegisterPage from "./components/TeamRegister"
import CreateTeamPage from "./components/CreateTeam"
import JoinTeamPage from "./components/JoinTeam"
import ViewEventPage from "./components/View"




const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/friends"
                element={
                  <div className="p-8 text-center text-muted-foreground">
                    Friends page coming soon...
                  </div>
                }
              />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/events" element={<EventsPage />} /> {/* ✅ fixed usage */}
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/registration/:eventId" element={<RegistrationPage />} />
              <Route path="/teamregister/:eventId" element={<TeamRegisterPage />} />
              <Route path="/createteam/:eventId" element={<CreateTeamPage />} />
              <Route path="/jointeam/:eventId" element={<JoinTeamPage />} />
              <Route path="/view/:eventId" element={<ViewEventPage />} />




            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
