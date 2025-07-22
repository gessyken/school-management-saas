// components/SchoolCreateModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

const SchoolCreateModal = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await api.post("/schools/register", {
        name,
        email,
        subdomain,
      });
      toast({ title: "École créée avec succès" });
      console.log(data.data.school._id);
      if (data?.data?.school?._id) onSuccess(data?.data?.school?._id);
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error?.response?.data?.message || "Erreur de création",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-lg p-6 bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-sky-600">
            {t("schoolCreate.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div>
            <Label htmlFor="schoolName">{t("schoolCreate.schoolName")}</Label>
            <Input
              id="schoolName"
              placeholder={t("schoolCreate.schoolNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="schoolEmail">{t("schoolCreate.email")}</Label>
            <Input
              id="schoolEmail"
              type="email"
              placeholder={t("schoolCreate.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="schoolSubdomain">
              {t("schoolCreate.subdomain")}
            </Label>
            <Input
              id="schoolSubdomain"
              placeholder={t("schoolCreate.subdomainPlaceholder")}
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white transition-colors"
          >
            {loading ? t("schoolCreate.creating") : t("schoolCreate.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolCreateModal;
