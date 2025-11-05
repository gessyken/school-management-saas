import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
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
import AcademicYears from "./pages/AcademicYearLayout";
import Reports from "./pages/Reports";
import Finances from "./pages/Finances";
import Administration from "./pages/Administration";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { School, Menu } from "lucide-react";
import AcademicYearOverview from "./pages/AcademicYear/AcademicYearOverview";
import AcademicYearLayout from "./pages/AcademicYearLayout";
import GradesManagement from "./pages/AcademicYear/GradesManagement";
import FeesManagement from "./pages/AcademicYear/FeesManagement";
import FeesStatistics from "./pages/AcademicYear/FeeStatistics";
import ClassmentManagement from "./pages/AcademicYear/ClassmentManagement";
import ReportCardManagement from "./pages/AcademicYear/ReportCardManagement";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <School className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Chargement</h2>
            <p className="text-muted-foreground">Initialisation de votre espace...</p>
          </div>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <main className="flex-1 h-screen overflow-auto bg-gradient-to-br from-background via-background to-muted/20 lg:ml-0">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 bg-primary text-primary-foreground rounded-lg shadow-lg flex items-center justify-center hover:bg-primary-hover transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-h-full">
          {children}
        </div>
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
        <Route path="/academic-years" element={
          <ProtectedLayout>
            <AcademicYearLayout />
          </ProtectedLayout>
        }>
          {/* All tab routes */}
          <Route path="overview" element={<AcademicYearOverview />} />
          <Route path="grades" element={<GradesManagement />} />
          <Route path="fees" element={<FeesManagement />} />
          <Route path="fees-statis" element={<FeesStatistics />} />
          <Route path="ranks" element={<ClassmentManagement />} />
          <Route path="reports" element={<ReportCardManagement />} />
          
          {/* Default route */}
          <Route index element={<AcademicYearOverview />} />
        </Route>
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
