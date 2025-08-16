import React, { useEffect, useState } from "react";
import {
  settingService,
  Term,
  AcademicYear,
} from "@/lib/services/settingService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Pencil, Trash, Plus, AlertCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const TermManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [terms, setTerms] = useState<Term[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Term | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    academicYear: "",
  });
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    academicYear: "",
    isActive: true,
  });

  const fetchData = async () => {
    setError(null);
    try {
      const [termData, yearData] = await Promise.all([
        settingService.getTerms(),
        settingService.getAcademicYears(),
      ]);
      setTerms(termData);
      setAcademicYears(yearData);
      if (yearData.length > 0 && filter.academicYear === "") {
        setFilter({
          academicYear: yearData[yearData.length - 1].name,
        });
      }
    } catch (error) {
      console.error('Error fetching terms and academic years:', error);
      setError(t('school.settings.term.error.loading'));
      toast({ variant: "destructive", description: t('school.settings.term.error.loading') });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      startDate: "",
      endDate: "",
      academicYear: "",
      isActive: true,
    });
    setEditItem(null);
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (editItem && editItem._id) {
        await settingService.updateTerm(editItem._id, form);
        toast({ description: t('school.settings.term.success.update'), variant: "default" });
      } else {
        await settingService.createTerm(form);
        toast({ description: t('school.settings.term.success.create'), variant: "default" });
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving term:', error);
      setError(t('school.settings.term.error.save'));
      toast({ variant: "destructive", description: t('school.settings.term.error.save') });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('school.settings.term.confirm.delete'))) return;
    setError(null);
    try {
      await settingService.deleteTerm(id);
      toast({ description: t('school.settings.term.success.delete'), variant: "default" });
      fetchData();
    } catch (error) {
      console.error('Error deleting term:', error);
      setError(t('school.settings.term.error.delete'));
      toast({ variant: "destructive", description: t('school.settings.term.error.delete') });
    }
  };

  const handleEdit = (term: Term) => {
    setEditItem(term);
    setForm({
      name: term.name,
      startDate: term.startDate?.slice(0, 10),
      endDate: term.endDate?.slice(0, 10),
      academicYear: term.academicYear || "",
      isActive: term.isActive,
    });
    setDialogOpen(true);
  };

  const filteredTerms = terms
    .filter((term) =>
      term.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((term) =>
      filter.academicYear ? term.academicYear === filter.academicYear : true
    );
    
  const changeStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = currentStatus ? "inactive" : "active";
    setError(null);
    try {
      await settingService.updateTerm(id, {
        isActive: !currentStatus,
      });
      toast({ 
        description: t(`school.settings.term.status.${newStatus}`), 
        variant: "default" 
      });
      fetchData();
    } catch (error) {
      console.error('Error changing term status:', error);
      setError(t('school.settings.term.error.status'));
      toast({
        variant: "destructive",
        description: t('school.settings.term.error.status'),
      });
    }
  };
  
  return (
    <Card className="m-4 shadow-lg border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-xl font-bold">
          {t('school.settings.term.title')}
        </CardTitle>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            required
            value={filter.academicYear}
            onChange={(e) =>
              setFilter({ ...filter, academicYear: e.target.value })
            }
            className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {academicYears.map((year) => (
              <option key={year._id} value={year.name}>
                {year.name}
              </option>
            ))}
          </select>
          <Input
            placeholder={t('school.settings.term.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> {t('school.settings.term.add.button')}
          </Button>
        </div>
      </CardHeader>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      <CardContent className="grid gap-4">
        {filteredTerms.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {t('school.settings.term.no_results')}
          </p>
        ) : (
          filteredTerms.map((term) => (
            <div
              key={term._id}
              className="flex justify-between items-center border p-3 rounded-md shadow-sm"
            >
              <div>
                <p className="font-medium">{term.name}</p>
                <p className="text-sm text-muted-foreground">
                  {term.startDate?.slice(0, 10)} - {term.endDate?.slice(0, 10)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('school.settings.term.academic_year')}: {term.academicYear || t('school.settings.term.na')}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Label className="relative inline-flex items-center cursor-pointer mt-2">
                  <Input
                    type="checkbox"
                    className="sr-only peer"
                    checked={term.isActive}
                    onChange={() => changeStatus(term._id!, term.isActive)}
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full peer-checked:translate-x-5 transition"></div>
                </Label>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleEdit(term)}
                  aria-label={t('school.settings.term.edit.aria_label')}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(term._id!)}
                  aria-label={t('school.settings.term.delete.aria_label')}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <h3 className="text-lg font-semibold">
              {editItem ? t('school.settings.term.edit.title') : t('school.settings.term.add.title')}
            </h3>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <select
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>
                {t('school.settings.term.select.placeholder')}
              </option>
              <option value="Term 1">{t('school.settings.term.term1')}</option>
              <option value="Term 2">{t('school.settings.term.term2')}</option>
              <option value="Term 3">{t('school.settings.term.term3')}</option>
              <option value="Term 4">{t('school.settings.term.term4')}</option>
            </select>
            <Label className="relative inline-flex items-center cursor-pointer mt-2">
              <Input
                type="checkbox"
                className="sr-only peer"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full peer-checked:translate-x-5 transition"></div>
              <span className="ml-3 text-sm font-medium text-foreground">
                {form.isActive ? t('school.settings.term.active') : t('school.settings.term.inactive')}
              </span>
            </Label>
            <Input
              required
              type="date"
              placeholder={t('school.settings.term.start_date')}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              required
              type="date"
              placeholder={t('school.settings.term.end_date')}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            <select
              required
              value={form.academicYear}
              onChange={(e) =>
                setForm({ ...form, academicYear: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>
                {t('school.settings.term.select_academic_year')}
              </option>
              {academicYears.map((year) => (
                <option key={year._id} value={year.name}>
                  {year.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t('school.settings.term.cancel')}
              </Button>
              <Button type="submit">
                {editItem ? t('school.settings.term.update') : t('school.settings.term.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TermManagement;