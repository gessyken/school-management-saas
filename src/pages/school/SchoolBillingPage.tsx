import { useEffect, useState } from "react";
import { billingService } from "@/lib/services/billingService";
import { invoiceService } from "@/lib/services/invoiceService";
import { SCHOOL_KEY } from "@/lib/key";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import InvoiceHistory from "@/components/InvoiceHistory";
import { useTranslation } from "react-i18next";

const SchoolBillingPage = () => {
  const [loading, setLoading] = useState(true);
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const schoolId: string | null = (() => {
    const stored = localStorage.getItem(SCHOOL_KEY);
    if (!stored) navigate("/schools-select");
    const school = JSON.parse(stored);
    return school?._id || null;
  })();

  useEffect(() => {
    if (!schoolId) return;

    const loadData = async () => {
      try {
        const [billingRes, invoiceRes] = await Promise.all([
          billingService.get(schoolId),
          invoiceService.getBySchool(schoolId),
        ]);
        setBillingInfo(billingRes.data);
        setInvoices(invoiceRes.data);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de facturation.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [schoolId]);

  const handleUsageChange = (key: string, value: number) => {
    setBillingInfo((prev: any) => ({
      ...prev,
      usage: {
        ...prev.usage,
        [key]: value,
      },
    }));
  };

  const updateUsage = async () => {
    if (!schoolId || !billingInfo) return;
    setSubmitting(true);
    try {
      await billingService.updateUsage(schoolId, billingInfo.usage);
      toast({ title: "Utilisation mise à jour avec succès" });
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour de l'utilisation.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string, phoneNumber?: string) => {
    try {
      await invoiceService.pay(invoiceId, phoneNumber); // Pass to backend
      toast({ title: "Facture marquée comme payée" });
      const invoiceRes = await invoiceService.getBySchool(schoolId!);
      setInvoices(invoiceRes.data);
    } catch {
      toast({
        title: "Erreur",
        description: "Échec du paiement",
        variant: "destructive",
      });
    }
  };

  if (loading || !billingInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Chargement des données...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-skyblue">{t("billing.title")}</h2>

      {/* Usage Section */}
      <Card>
        <CardHeader>
          <CardHeader>
            <h3 className="font-semibold">{t("billing.usageTitle")}</h3>
          </CardHeader>
        </CardHeader>
        <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {["studentsCount", "staffCount", "classCount"].map((key) => (
            <div key={key}>
              <label className="block text-sm capitalize mb-1">
                 {t(`usage.${key}`)}
              </label>
              <Input
                type="number"
                value={billingInfo.usage[key]}
                onChange={(e) =>
                  handleUsageChange(key, parseInt(e.target.value))
                }
              />
            </div>
          ))}
          <Button onClick={updateUsage} disabled={submitting} className="mt-3">
            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t("billing.saveUsage")}
          </Button>
        </CardContent>
      </Card>

      {/* Invoices Section */}
      <InvoiceHistory
        invoices={invoices}
        schoolId={schoolId}
        setInvoices={setInvoices}
        handlePayInvoice={handlePayInvoice}
      />
    </div>
  );
};

export default SchoolBillingPage;
