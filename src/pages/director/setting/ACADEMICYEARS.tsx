import React, { useEffect, useState } from "react";
import { settingService, AcademicYear } from "@/lib/services/settingService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Pencil, Trash, Plus, AlertCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const AcademicYearManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<AcademicYear | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: true,
  });

  // Fetch all academic years
  const fetchAcademicYears = async () => {
    setError(null);
    try {
      const data = await settingService.getAcademicYears();
      setAcademicYears(data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setError(t('school.settings.year.error.load'));
      toast({
        variant: "destructive",
        description: t('school.settings.year.error.load'),
      });
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const resetForm = () => {
    setForm({ name: "", startDate: "", endDate: "", isCurrent: false });
    setEditItem(null);
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (editItem && editItem._id) {
        await settingService.updateAcademicYear(editItem._id, form);
        toast({ 
          description: t('school.settings.year.success.update'), 
          variant: "default" 
        });
      } else {
        await settingService.createAcademicYear(form);
        toast({ 
          description: t('school.settings.year.success.create'), 
          variant: "default" 
        });
      }
      setDialogOpen(false);
      resetForm();
      fetchAcademicYears();
    } catch (error) {
      console.error('Error saving academic year:', error);
      setError(t('school.settings.year.error.save'));
      toast({
        variant: "destructive",
        description: t('school.settings.year.error.save'),
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('school.settings.year.confirm.delete')))
      return;
    setError(null);
    try {
      await settingService.deleteAcademicYear(id);
      toast({ 
        description: t('school.settings.year.success.delete'), 
        variant: "default" 
      });
      fetchAcademicYears();
    } catch (error) {
      console.error('Error deleting academic year:', error);
      setError(t('school.settings.year.error.delete'));
      toast({
        variant: "destructive",
        description: t('school.settings.year.error.delete'),
      });
    }
  };

  const handleEdit = (item: AcademicYear) => {
    setEditItem(item);
    setForm({
      name: item.name,
      startDate: item?.startDate?.slice(0, 10),
      endDate: item?.endDate?.slice(0, 10),
      isCurrent: item.isCurrent,
    });
    setDialogOpen(true);
  };

  const filteredAcademicYears = academicYears.filter((ay) =>
    ay.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentYear = new Date().getFullYear();

  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(`${y}-${y + 1}`);
  }

  const changeStatus = async (id: string, currentStatus: boolean) => {
    setError(null);
    try {
      await settingService.updateAcademicYear(id, {
        isCurrent: !currentStatus,
      });
      toast({ 
        variant: "default",
        description: t(`school.settings.year.status.${!currentStatus ? 'active' : 'inactive'}`)
      });
      fetchAcademicYears();
    } catch (error) {
      console.error('Error updating academic year status:', error);
      setError(t('school.settings.year.error.status'));
      toast({
        variant: "destructive",
        description: t('school.settings.year.error.status'),
      });
    }
  };

  return (
    <Card className="m-4 shadow-lg border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-xl font-bold">
          {t('school.settings.year.title')}
        </CardTitle>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            placeholder={t('school.settings.year.search')}
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
            <Plus className="mr-1 h-4 w-4" /> {t('school.settings.year.add')}
          </Button>
        </div>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CardContent className="grid gap-4">
        {filteredAcademicYears.length === 0 && (
          <p className="text-center text-muted-foreground">
            {t('school.settings.year.empty')}
          </p>
        )}

        {filteredAcademicYears.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center border p-3 rounded-md shadow-sm"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item?.startDate?.slice(0, 10)} - {item?.endDate?.slice(0, 10)}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <Label className="relative inline-flex items-center cursor-pointer mt-2">
                <Input
                  type="checkbox"
                  className="sr-only peer"
                  checked={item.isCurrent}
                  onChange={() => changeStatus(item._id!, item.isCurrent)}
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full peer-checked:translate-x-5 transition"></div>
              </Label>

              <Button
                size="icon"
                variant="outline"
                onClick={() => handleEdit(item)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => handleDelete(item._id!)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <h3 className="text-lg font-semibold">
              {editItem ? t('school.settings.year.edit') : t('school.settings.year.create')}
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
              className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            >
              <option value="" disabled>
                {t('school.settings.year.select')}
              </option>
              {years.map((yearRange) => (
                <option key={yearRange} value={yearRange}>
                  {yearRange}
                </option>
              ))}
            </select>
            <Label className="relative inline-flex items-center cursor-pointer mt-2">
              <Input
                type="checkbox"
                className="sr-only peer"
                checked={form.isCurrent}
                onChange={(e) =>
                  setForm({ ...form, isCurrent: e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full peer-checked:translate-x-5 transition"></div>
              <span className="ml-3 text-sm font-medium text-foreground">
                {form.isCurrent ? t('school.settings.year.active') : t('school.settings.year.inactive')}
              </span>
            </Label>

            <Input
              required
              type="date"
              placeholder={t('school.settings.year.startDate')}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              required
              type="date"
              placeholder={t('school.settings.year.endDate')}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t('school.settings.year.cancel')}
              </Button>
              <Button type="submit">
                {editItem ? t('school.settings.year.update') : t('school.settings.year.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AcademicYearManagement;