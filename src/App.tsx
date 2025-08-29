import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DirectorDashboard from "@/pages/director/DirectorDashboard";
import ClassesManagement from "@/pages/director/ClassesManagement";
import SettingManagement from "@/pages/director/SettingManagement";
import SubjectManagement from "@/pages/director/SubjectManagement";
import DirectorStudents from "@/pages/director/StudentManagement";
import FeesManagement from "@/pages/director/FeesManagement";
import GradesManagement from "@/pages/director/GradesManagement";
import DirectorStatistics from "@/pages/director/DirectorStatistics";
import SecretaryDashboard from "@/pages/secretary/SecretaryDashboard";
import SecretaryClasses from "@/pages/secretary/SecretaryClasses";
import SecretaryStudents from "@/pages/secretary/StudentsPage";
import SecretaryPayments from "@/pages/secretary/SecretaryPayments";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherClasses from "@/pages/teacher/TeacherClasses";
import TeacherGrades from "@/pages/teacher/TeacherGrades";
import NotFoundPage from "@/pages/NotFoundPage";
import ClassesList from "@/pages/director/ClassList";
import ResultManagement from "./pages/director/ResultManagement";
import SchoolSelectPage from "./pages/SchoolSelectPage";
import SchoolDashboardLayout from "./pages/school/SchoolDashboardLayout";
import EditSchoolPage from "./pages/school/EditSchoolPage";
import JoinRequestsPage from "./pages/school/JoinRequestsPage";
import ManageMembersPage from "./pages/school/ManageMembersPage";
import SchoolLogsPage from "./pages/school/LogPage";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ProfilePage from "./pages/auth/ProfilePage";
import { SchoolProvider } from "./context/SchoolContext";
import AdminDashboardLayout from "./pages/admin/DashboardLayout";
import AdminDashboard from "./pages/admin/DashboardPage";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageSchools from "./pages/admin/ManageSchools";
import SchoolDetail from "./pages/admin/SchoolDetail";
import SchoolBillingPage from "./pages/school/SchoolBillingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SchoolProvider>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="/schools-select" element={<SchoolSelectPage />} />

              <Route element={<ProtectedRoute requireSchool />}>
                <Route path="/school-dashboard" element={<SchoolDashboardLayout />}>
                  <Route index element={<DirectorStatistics />} />
                  <Route path="academic" element={<Outlet />}>
                    <Route path="subjects" element={<SubjectManagement />} />
                    <Route path="classes" element={<ClassesManagement />} />
                    <Route path="students" element={<DirectorStudents />} />
                    <Route path="results" element={<ResultManagement />} />
                    <Route path="classes-list" element={<ClassesList />} />
                    <Route path="settings" element={<SettingManagement />} />
                    <Route path="payments" element={<FeesManagement />} />
                    <Route path="grades" element={<GradesManagement />} />
                    <Route path="statistics" element={<DirectorStatistics />} />
                  </Route>
                  {/* <Route path="overview" element={<OverviewPage />} /> */}
                  <Route path="edit" element={<EditSchoolPage />} />
                  <Route path="join-requests" element={<JoinRequestsPage />} />
                  <Route path="members" element={<ManageMembersPage />} />
                  <Route path="billing" element={<SchoolBillingPage />} />
                  <Route path="logs" element={<SchoolLogsPage />} />
                </Route>
              </Route>
              <Route path="/admin-dashboard" element={<AdminDashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="manage-schools" element={<Outlet />}>
                  <Route index element={<ManageSchools />} />
                  <Route path=":id" element={<SchoolDetail />} />
                </Route>
              </Route>
              {/* Redirect from root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Catch-all route - 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </SchoolProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
