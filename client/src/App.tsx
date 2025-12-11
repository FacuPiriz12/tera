import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { TransferProvider } from "@/contexts/TransferContext";
import GlobalTransferIndicator from "@/components/GlobalTransferIndicator";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
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
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...props }: { component: React.ComponentType<any>, path?: string }) {
  const { isAuthenticated, error } = useAuth();
  
  if (!isAuthenticated || error) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...props} />;
}

function AdminRoute({ component: Component, ...props }: { component: React.ComponentType<any>, path?: string }) {
  const { isAuthenticated, user, error } = useAuth();
  
  if (!isAuthenticated || error) {
    return <Redirect to="/login" />;
  }
  
  if (user?.role !== 'admin') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }
  
  return <Component {...props} />;
}

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();
  
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

  return (
    <Switch>
      {/* Public routes - available to all users */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/signup/success" component={SignupSuccess} />
      <Route path="/auth/verify" component={EmailVerification} />
      <Route path="/auth/confirm" component={EmailConfirmation} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      
      {/* Landing page for non-authenticated users */}
      <Route path="/">
        {() => (!isAuthenticated || error) ? <Landing /> : <Home />}
      </Route>
      
      {/* Protected routes - redirect to login if not authenticated */}
      <Route path="/shared-drives">
        {() => <ProtectedRoute component={() => <div>Drives Compartidos (En desarrollo)</div>} />}
      </Route>
      <Route path="/operations">
        {() => <ProtectedRoute component={Operations} />}
      </Route>
      <Route path="/integrations">
        {() => <ProtectedRoute component={Integrations} />}
      </Route>
      <Route path="/cloud-explorer">
        {() => <ProtectedRoute component={CloudExplorer} />}
      </Route>
      <Route path="/my-files">
        {() => <ProtectedRoute component={MyFiles} />}
      </Route>
      <Route path="/shared">
        {() => <ProtectedRoute component={ShareInbox} />}
      </Route>
      <Route path="/analytics">
        {() => <ProtectedRoute component={Analytics} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/users">
        {() => <AdminRoute component={AdminUsers} />}
      </Route>
      <Route path="/admin/operations">
        {() => <AdminRoute component={AdminOperations} />}
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
