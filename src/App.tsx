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
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/schools-select" element={<SchoolSelectPage />} />
              <Route path="/school-dashboard" element={<SchoolDashboardLayout />}>
                <Route path="academic" element={<Outlet />}>
                  <Route path="classes" element={<ClassesManagement />} />
                  <Route path="subjects" element={<SubjectManagement />} />
                  <Route path="results" element={<ResultManagement />} />
                  <Route path="students" element={<DirectorStudents />} />
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
                <Route path="billing" element={<h1>Billing Logic</h1>} />
                <Route path="logs" element={<SchoolLogsPage />} />
              </Route>

              {/* Redirect from root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Director Routes */}
              <Route
                path="/director/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <DirectorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/subjects"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <SubjectManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/classes"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <ClassesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/results"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <ResultManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/classes-list"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <ClassesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/settings"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <SettingManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/students"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <DirectorStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/payments"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <FeesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/grades"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <GradesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/director/statistics"
                element={
                  <ProtectedRoute allowedRoles={["DIRECTOR"]}>
                    <DirectorStatistics />
                  </ProtectedRoute>
                }
              />

              {/* Secretary Routes */}
              <Route
                path="/secretary/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["SECRETARY"]}>
                    <SecretaryDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/secretary/classes"
                element={
                  <ProtectedRoute allowedRoles={["SECRETARY"]}>
                    <SecretaryClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/secretary/students"
                element={
                  <ProtectedRoute allowedRoles={["SECRETARY"]}>
                    <SecretaryStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/secretary/payments"
                element={
                  <ProtectedRoute allowedRoles={["SECRETARY"]}>
                    <SecretaryPayments />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["TEACHER"]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/classes"
                element={
                  <ProtectedRoute allowedRoles={["TEACHER"]}>
                    <TeacherClasses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/grades"
                element={
                  <ProtectedRoute allowedRoles={["TEACHER"]}>
                    <TeacherGrades />
                  </ProtectedRoute>
                }
              />

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
