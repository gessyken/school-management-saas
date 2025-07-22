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
import { Pencil, Trash, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

const TermManagement = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [terms, setTerms] = useState<Term[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Term | null>(null);
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
    } catch {
      toast({ variant: "destructive", description: "Failed to fetch data." });
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
    try {
      if (editItem && editItem._id) {
        await settingService.updateTerm(editItem._id, form);
        toast({ description: "Term updated successfully." });
      } else {
        await settingService.createTerm(form);
        toast({ description: "Term created successfully." });
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch {
      toast({ variant: "destructive", description: "Failed to save term." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this term?")) return;
    try {
      await settingService.deleteTerm(id);
      toast({ description: "Term deleted successfully." });
      fetchData();
    } catch {
      toast({ variant: "destructive", description: "Failed to delete term." });
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
    try {
      await settingService.updateTerm(id, {
        isActive: !currentStatus,
      });
      toast({ description: `Status changed to ${newStatus}.` });
      fetchData();
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to update status.",
      });
    }
  };
  return (
    <Card className="m-4 shadow-lg border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-xl font-bold">
          {t("termManagement.title")}
        </CardTitle>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            required
            value={filter.academicYear}
            onChange={(e) =>
              setFilter({ ...filter, academicYear: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {academicYears.map((year) => (
              <option key={year._id} value={year.name}>
                {year.name}
              </option>
            ))}
          </select>
          <Input
            placeholder={t("termManagement.searchPlaceholder")}
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
            <Plus className="mr-1 h-4 w-4" /> {t("termManagement.addButton")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {filteredTerms.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {t("termManagement.noTermsFound")}
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
                  {t("termManagement.yearLabel")}:{" "}
                  {term.academicYear || t("common.na")}
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
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
                </Label>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleEdit(term)}
                  aria-label={t("termManagement.edit")}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(term._id!)}
                  aria-label={t("termManagement.delete")}
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
              {editItem
                ? t("termManagement.editTerm")
                : t("termManagement.addTerm")}
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                {t("termManagement.selectTerm")}
              </option>
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={`${t("termManagement.term")} ${num}`}>
                  {t("termManagement.term")} {num}
                </option>
              ))}
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
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {form.isActive
                  ? t("termManagement.active")
                  : t("termManagement.inactive")}
              </span>
            </Label>
            <Input
              required
              type="date"
              placeholder={t("termManagement.startDate")}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              required
              type="date"
              placeholder={t("termManagement.endDate")}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            <select
              required
              value={form.academicYear}
              onChange={(e) =>
                setForm({ ...form, academicYear: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                {t("termManagement.selectAcademicYear")}
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
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                {editItem
                  ? t("termManagement.updateButton")
                  : t("termManagement.createButton")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TermManagement;
