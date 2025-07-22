import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "male",
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-white px-4 py-10">
      <LanguageSwitcher className="absolute top-3 right-3"/>
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg border border-gray-100">
          <form onSubmit={handleRegister}>
            <CardHeader className="mb-4 text-center">
              <h2 className="text-2xl font-bold text-sky-600">{t("registerPage.title")}</h2>
              <p className="text-sm text-gray-500">{t("registerPage.subtitle")}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="firstName">{t("registerPage.firstName")}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">{t("registerPage.lastName")}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">{t("registerPage.email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">{t("registerPage.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">{t("registerPage.phoneNumber")}</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="gender">{t("registerPage.gender")}</Label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="male">{t("registerPage.genderMale")}</option>
                  <option value="female">{t("registerPage.genderFemale")}</option>
                  <option value="other">{t("registerPage.genderOther")}</option>
                </select>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white transition"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("registerPage.loading")}
                  </>
                ) : (
                  t("registerPage.submit")
                )}
              </Button>

              <p className="text-sm text-center text-gray-500">
                {t("registerPage.alreadyAccount")}{" "}
                <Link
                  to="/login"
                  className="text-sky-600 hover:underline font-medium"
                >
                  {t("registerPage.login")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
