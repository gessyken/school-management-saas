import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterData, useAuth } from "@/context/AuthContext";
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
import { Loader2, Eye, EyeOff, School, Users, UserPlus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
  const [form, setForm] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "male",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, socialLogin } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // console.log(form)
      await register(form);
      toast({
        title: t('register.success.title'),
        description: t('register.success.description'),
        variant: "default",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: t('register.error.title'),
        description: error instanceof Error ? error.message : t('register.error.description'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      // Mock Google auth - replace with your actual implementation
      const googleEmail = await initiateGoogleAuth();
      await socialLogin(googleEmail);
      navigate("/schools-select");
    } catch (error) {
      toast({
        title: t('register.googleError.title'),
        description: t('register.googleError.description'),
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Mock function for Google auth - replace with your actual implementation
  const initiateGoogleAuth = async (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("user@gmail.com"); // Mock email
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden p-4">
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
              <UserPlus className="h-8 w-8 text-white" />
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

        {/* Register Card */}
        <Card className="backdrop-blur-sm bg-background/80 border-0 shadow-2xl">
          <form onSubmit={handleRegister}>
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  {t('register.title')}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('register.subtitle')}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    {t('register.firstName')}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder={t('register.firstNamePlaceholder')}
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    {t('register.lastName')}
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder={t('register.lastNamePlaceholder')}
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  {t('register.email')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('register.emailPlaceholder')}
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t('register.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                    {t('register.phone')}
                  </Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder={t('register.phonePlaceholder')}
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-foreground">
                    {t('register.gender')}
                  </Label>
                  <select
                    name="gender"
                    id="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="h-12 w-full rounded-md border border-border px-4 bg-background focus:border-primary focus:ring-primary transition-all duration-200"
                  >
                    <option value="male">{t('register.genderOptions.male')}</option>
                    <option value="female">{t('register.genderOptions.female')}</option>
                    <option value="other">{t('register.genderOptions.other')}</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('register.loading')}
                  </>
                ) : (
                  t('register.button')
                )}
              </Button>

              {/* Google Register Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-2 border-border hover:bg-background/90 transition-colors"
                onClick={handleGoogleRegister}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <FcGoogle className="h-5 w-5" />
                    {t('register.googleButton')}
                  </>
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('register.orContinueWith')}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('register.haveAccount')}{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                  >
                    {t('register.loginLink')}
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

export default RegisterPage;