import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Eye, EyeOff, School, GraduationCap, Users, UserPlus } from "lucide-react";
import api from "@/lib/api";

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "homme",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
        setTimeout(() => {
            navigate("/login");
        }, 1000);
    } catch (error) {
      toast({
        title: "Erreur lors de l'inscription",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md space-y-8">
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
              MI-TECH École
            </h1>
            <p className="text-muted-foreground mt-2">Rejoignez notre plateforme de gestion scolaire</p>
          </div>
        </div>

        {/* Register Card */}
        <Card className="backdrop-blur-sm bg-background/80 border-0 shadow-2xl">
          <form onSubmit={handleRegister}>
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Créer un compte
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Remplissez les informations ci-dessous pour rejoindre notre plateforme
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">Prénom</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Votre prénom"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Votre nom"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Adresse email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Mot de passe</Label>
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
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="+33 6 12 34 56 78"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="h-12 px-4 border-border focus:border-primary focus:ring-primary transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-foreground">Genre</Label>
                  <select
                    name="gender"
                    id="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="h-12 w-full rounded-md border border-border px-4 bg-background focus:border-primary focus:ring-primary transition-all duration-200"
                  >
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
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
                    Création en cours...
                  </>
                ) : (
                  "Créer un compte"
                )}
              </Button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Vous avez déjà un compte ?{' '}
                  <Link 
                    to="/login" 
                    className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 MI-TECH École. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
