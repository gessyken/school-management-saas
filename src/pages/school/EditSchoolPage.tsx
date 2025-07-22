import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { SCHOOL_KEY } from "@/lib/key";
import { useTranslation } from "react-i18next";

interface SchoolData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
}

const EditSchoolPage = () => {
  //   const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const schoolId: String | null = (() => {
    const stored = localStorage.getItem(SCHOOL_KEY);
    if (!stored) {
      navigate("/schools-select");
    }
    let schoolObj = JSON.parse(stored);
    return schoolObj ? schoolObj._id : null;
  })();

  const { toast } = useToast();

  const [formData, setFormData] = useState<SchoolData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    logoUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current school data
  useEffect(() => {
    if (!schoolId) return;

    const fetchSchool = async () => {
      try {
        const res = await api.get(`/schools/${schoolId}`);
        setFormData(res.data);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de l'école.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [schoolId, toast]);

  // Simple validation function
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation",
        description: "Le nom est requis.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.email.trim()) {
      toast({
        title: "Validation",
        description: "L'email est requis.",
        variant: "destructive",
      });
      return false;
    }
    // Basic email regex
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation",
        description: "L'email est invalide.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleChange =
    (field: keyof SchoolData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await api.put(`/schools/${schoolId}`, formData);
      toast({
        title: "Succès",
        description: "Les détails de l'école ont été mis à jour.",
      });
      navigate("/school-dashboard"); // Or wherever you want to go after saving
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'école.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-skyblue" />
      </div>
    );
  }
  return (
    <Card className="max-w-3xl mx-auto shadow-md border border-gray-200">
      <form onSubmit={handleSubmit}>
        <CardHeader className="bg-skyblue/10 p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold text-skyblue">
            {t("editSchool.title")}
          </h2>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          <div>
            <Label htmlFor="name">{t("editSchool.name")}</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange("name")}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">{t("editSchool.email")}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">{t("editSchool.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange("phone")}
            />
          </div>

          <div>
            <Label htmlFor="address">{t("editSchool.address")}</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={handleChange("address")}
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">{t("editSchool.logoUrl")}</Label>
            <Input
              id="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={handleChange("logoUrl")}
            />
          </div>
        </CardContent>

        <CardFooter className="p-6">
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-skyblue hover:bg-skyblue/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("editSchool.saving")}
              </>
            ) : (
              t("editSchool.save")
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditSchoolPage;
