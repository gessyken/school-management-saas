import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectSchool from "./pages/SelectSchool";
import CreateSchool from "./pages/CreateSchool";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Classes from "./pages/Classes";
import AcademicYears from "./pages/AcademicYears";
import Reports from "./pages/Reports";
import Finances from "./pages/Finances";
import Administration from "./pages/Administration";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Composant pour gérer les redirections via événements
const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleRedirect = (event: CustomEvent<{ path: string }>) => {
      navigate(event.detail.path);
    };
    
    window.addEventListener('auth:redirect', handleRedirect as EventListener);
    
    return () => {
      window.removeEventListener('auth:redirect', handleRedirect as EventListener);
    };
  }, [navigate]);
  
  return null;
};

// Layout protégé avec sidebar
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <>
      <AuthRedirectHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/select-school" element={<SelectSchool />} />
      <Route path="/create-school" element={<CreateSchool />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedLayout>
            <Students />
          </ProtectedLayout>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedLayout>
            <Subjects />
          </ProtectedLayout>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedLayout>
            <Classes />
          </ProtectedLayout>
        }
      />
      <Route
        path="/academic-years"
        element={
          <ProtectedLayout>
            <AcademicYears />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedLayout>
            <Reports />
          </ProtectedLayout>
        }
      />
      <Route
        path="/finances"
        element={
          <ProtectedLayout>
            <Finances />
          </ProtectedLayout>
        }
      />
      <Route
        path="/administration"
        element={
          <ProtectedLayout>
            <Administration />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
