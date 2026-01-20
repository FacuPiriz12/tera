import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { TransferProvider } from "@/contexts/TransferContext";
import GlobalTransferIndicator from "@/components/GlobalTransferIndicator";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import AuthPage from "@/pages/Auth";
import SignupSuccess from "@/pages/SignupSuccess";
import EmailVerification from "@/pages/EmailVerification";
import EmailConfirmation from "@/pages/EmailConfirmation";
import Home from "@/pages/Home";
import Operations from "@/pages/Operations";
import Integrations from "@/pages/Integrations";
import CloudExplorer from "@/pages/CloudExplorer";
import MyFiles from "@/pages/MyFiles";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminOperations from "@/pages/admin/Operations";
import ShareInbox from "@/pages/ShareInbox";
import Tasks from "@/pages/Tasks";
import FileVersions from "@/pages/FileVersions";
import CloudHealth from "@/pages/CloudHealth";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import EmailSent from "@/pages/EmailSent";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const isLoggedIn = isAuthenticated && !error;
  const isAdmin = isLoggedIn && user?.role === 'admin';

  return (
    <Switch>
      {/* Public routes - available to all users */}
      <Route path="/login" component={AuthPage} />
      <Route path="/signup" component={AuthPage} />
      <Route path="/signup/success" component={SignupSuccess} />
      <Route path="/auth/verify" component={EmailVerification} />
      <Route path="/auth/confirm" component={EmailConfirmation} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/email-sent" component={EmailSent} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/pricing" component={Pricing} />
      
      {/* Landing page for non-authenticated users, Dashboard for authenticated */}
      <Route path="/">
        {() => isLoggedIn ? <Home /> : <Landing />}
      </Route>

      <Route path="/dashboard">
        {() => isLoggedIn ? <Home /> : <AuthPage />}
      </Route>
      
      <Route path="/home">
        {() => <Redirect to="/dashboard" />}
      </Route>
      
      {/* Protected routes - show Auth page if not authenticated */}
      <Route path="/shared-drives">
        {() => isLoggedIn ? <div>Drives Compartidos (En desarrollo)</div> : <AuthPage />}
      </Route>
      <Route path="/operations">
        {() => isLoggedIn ? <Operations /> : <AuthPage />}
      </Route>
      <Route path="/integrations">
        {() => isLoggedIn ? <Integrations /> : <AuthPage />}
      </Route>
      <Route path="/cloud-explorer">
        {() => isLoggedIn ? <CloudExplorer /> : <AuthPage />}
      </Route>
      <Route path="/my-files">
        {() => isLoggedIn ? <MyFiles /> : <AuthPage />}
      </Route>
      <Route path="/shared">
        {() => isLoggedIn ? <ShareInbox /> : <AuthPage />}
      </Route>
      <Route path="/analytics">
        {() => isLoggedIn ? <Analytics /> : <AuthPage />}
      </Route>
      <Route path="/files/versions">
        {() => isLoggedIn ? <FileVersions /> : <AuthPage />}
      </Route>
      <Route path="/settings">
        {() => isLoggedIn ? <Settings /> : <AuthPage />}
      </Route>
      <Route path="/profile">
        {() => isLoggedIn ? <Profile /> : <AuthPage />}
      </Route>
      <Route path="/tasks">
        {() => isLoggedIn ? <Tasks /> : <AuthPage />}
      </Route>
      <Route path="/health">
        {() => isLoggedIn ? <CloudHealth /> : <AuthPage />}
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        {() => {
          if (!isLoggedIn) return <AuthPage />;
          if (!isAdmin) return <div className="p-6 max-w-7xl mx-auto"><h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1><p>No tienes permisos para acceder a esta página.</p></div>;
          return <AdminDashboard />;
        }}
      </Route>
      <Route path="/admin/users">
        {() => {
          if (!isLoggedIn) return <AuthPage />;
          if (!isAdmin) return <div className="p-6 max-w-7xl mx-auto"><h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1><p>No tienes permisos para acceder a esta página.</p></div>;
          return <AdminUsers />;
        }}
      </Route>
      <Route path="/admin/operations">
        {() => {
          if (!isLoggedIn) return <AuthPage />;
          if (!isAdmin) return <div className="p-6 max-w-7xl mx-auto"><h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1><p>No tienes permisos para acceder a esta página.</p></div>;
          return <AdminOperations />;
        }}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TransferProvider>
          <Toaster />
          <Router />
          <GlobalTransferIndicator />
        </TransferProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
