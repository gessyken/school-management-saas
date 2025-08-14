import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Eye, EyeOff, School, GraduationCap, Users } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, socialLogin, isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/schools-select");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      toast({
        title: t('login.error.title'),
        description: t('login.error.description'),
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // This would be replaced with your actual Google auth implementation
      // For example, using Firebase or your backend's Google auth endpoint
      const googleEmail = await initiateGoogleAuth(); // Mock function
      await socialLogin(googleEmail);
    } catch (error) {
      toast({
        title: t('login.googleError.title'),
        description: t('login.googleError.description'),
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Mock function for Google auth - replace with your actual implementation
  const initiateGoogleAuth = async (): Promise<string> => {
    return new Promise((resolve) => {
      // In a real app, this would open Google auth popup
      setTimeout(() => {
        resolve("user@gmail.com"); // Mock email
      }, 1000);
    });
  };

  // Show loading state while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Language switcher */}
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-2">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <School className="h-8 w-8 text-white" />
            </div>
            <div className="p-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="p-3 bg-gradient-to-br from-primary/80 to-secondary/80 rounded-xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('app.name')}
            </h1>
            <p className="text-muted-foreground mt-2">{t('app.description')}</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-background/80 border-0 shadow-2xl">
          <form onSubmit={handleLogin}>
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  {t('login.title')}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('login.subtitle')}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  {t('login.email')}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t('login.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 px-4 pr-12 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('login.loading')}
                  </>
                ) : (
                  t('login.button')
                )}
              </Button>
              
              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-2 border-border hover:bg-background/90 transition-colors"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <FcGoogle className="h-5 w-5" />
                    {t('login.googleButton')}
                  </>
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('login.orContinueWith')}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('login.noAccount')}{' '}
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                  >
                    {t('login.createAccount')}
                  </Link>
                </p>
              </div>
              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {t('app.copyright')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;