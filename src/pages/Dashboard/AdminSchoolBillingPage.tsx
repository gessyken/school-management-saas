import { useEffect, useState } from "react";
import { billingService } from "@/lib/services/billingService";
import { invoiceService } from "@/lib/services/invoiceService";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
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

const AdminSchoolBillingPage = ({schoolId}) => {
//   const { schoolId } = useParams(); /
  const { toast } = useToast();

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
        console.log(billingRes, invoiceRes)
        setBillingInfo(billingRes.data);
        setInvoices(invoiceRes.data);
      } catch (err){
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
        Gestion de la facturation de l’école (Admin)
      </h2>

      {/* Billing Rules */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Règles de facturation</h3>
        </CardHeader>
        <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {[
            ["baseMonthlyFee", "Frais de base (mensuel)"],
            ["perStudentFee", "Coût par élève"],
            ["perStaffFee", "Coût par personnel"],
            ["perClassFee", "Coût par classe"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm mb-1">{label}</label>
              <Input
                type="number"
                value={billingInfo.billingRules[key]}
                onChange={(e) =>
                  handleRuleChange(key, parseFloat(e.target.value))
                }
              />
            </div>
          ))}
          <Button onClick={handleSaveRules} disabled={saving} className="mt-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Enregistrer les règles
          </Button>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Utilisation actuelle</h3>
        </CardHeader>
        <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <div><strong>Élèves:</strong> {billingInfo.usage.studentsCount}</div>
          <div><strong>Personnel:</strong> {billingInfo.usage.staffCount}</div>
          <div><strong>Classes:</strong> {billingInfo.usage.classCount}</div>
          <div><strong>Dernier calcul:</strong> {billingInfo.usage.lastUsageCalculated ? new Date(billingInfo.usage.lastUsageCalculated).toLocaleDateString() : "—"}</div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <InvoiceHistory invoices={invoices} />
    </div>
  );
};

export default AdminSchoolBillingPage;
