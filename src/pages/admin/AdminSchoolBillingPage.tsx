import { useEffect, useState } from "react";
import { billingService } from "@/lib/services/billingService";
import { invoiceService } from "@/lib/services/invoiceService";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InvoiceHistory from "@/components/InvoiceHistory";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";

const AdminSchoolBillingPage = ({ schoolId }) => {
  //   const { schoolId } = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    if (!schoolId) return;

    const fetchData = async () => {
      try {
        const [billingRes, invoiceRes] = await Promise.all([
          billingService.get(schoolId),
          invoiceService.getBySchool(schoolId),
        ]);
        console.log(billingRes, invoiceRes);
        setBillingInfo(billingRes.data);
        setInvoices(invoiceRes.data);
      } catch (err) {
        console.log(err);
        toast({
          title: "Erreur",
          description: "Chargement impossible.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  const handleRuleChange = (key: string, value: number) => {
    setBillingInfo((prev: any) => ({
      ...prev,
      billingRules: {
        ...prev.billingRules,
        [key]: value,
      },
    }));
  };

  const handleSaveRules = async () => {
    if (!schoolId || !billingInfo?.billingRules) return;
    setSaving(true);
    try {
      await billingService.updateRules(schoolId, billingInfo.billingRules);
      toast({ title: "Règles de facturation mises à jour" });
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !billingInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-600">
        {t("billing.adminTitle")}
      </h2>

      {/* Billing Rules */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <h3 className="font-semibold text-lg">{t("billing.rulesTitle")}</h3>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 p-6">
          {[
            ["baseMonthlyFee", "baseFee"],
            ["perStudentFee", "perStudent"],
            ["perStaffFee", "perStaff"],
            ["perClassFee", "perClass"],
          ].map(([key, labelKey]) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={key}>{t(`billing.rules.${labelKey}`)}</Label>
              <Input
                id={key}
                type="number"
                value={billingInfo.billingRules[key]}
                onChange={(e) =>
                  handleRuleChange(key, parseFloat(e.target.value))
                }
                className="w-full"
              />
            </div>
          ))}
          <div className="sm:col-span-2 md:col-span-3">
            <Button
              onClick={handleSaveRules}
              disabled={saving}
              className="mt-2 w-full sm:w-auto"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t("common.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <h3 className="font-semibold text-lg">{t("billing.usageTitle")}</h3>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 p-6">
          {[
            ["studentsCount", "students"],
            ["staffCount", "staff"],
            ["classCount", "classes"],
            ["lastUsageCalculated", "lastCalculation"],
          ].map(([key, labelKey]) => (
            <div key={key} className="space-y-1">
              <p className="text-sm font-medium text-gray-600">
                {t(`billing.usage.${labelKey}`)}:
              </p>
              <p className="text-lg font-semibold">
                {key === "lastUsageCalculated" && billingInfo.usage[key]
                  ? new Date(billingInfo.usage[key]).toLocaleDateString()
                  : billingInfo.usage[key] || 0}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <InvoiceHistory
        invoices={invoices}
        schoolId={schoolId}
        setInvoices={setInvoices}
      />
    </div>
  );
};

export default AdminSchoolBillingPage;
