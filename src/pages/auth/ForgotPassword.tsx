import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Loader2, Mail } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      toast({
        title: t('forgotPassword.success.title'),
        description: t('forgotPassword.success.description', { email }),
        variant: "default",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: t('forgotPassword.error.title'),
        description: t('forgotPassword.error.description'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('app.name')}
            </h1>
            <p className="text-muted-foreground mt-2">{t('forgotPassword.title')}</p>
          </div>
        </div>

        {/* Forgot Password Card */}
        <Card className="backdrop-blur-sm bg-background/80 border-0 shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  {t('forgotPassword.heading')}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('forgotPassword.subtitle')}
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
                    {t('forgotPassword.loading')}
                  </>
                ) : (
                  t('forgotPassword.button')
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('forgotPassword.rememberPassword')}{' '}
                  <Link 
                    to="/login" 
                    className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                  >
                    {t('forgotPassword.loginLink')}
                  </Link>
                </p>
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

export default ForgotPasswordPage;