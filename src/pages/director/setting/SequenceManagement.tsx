import React, { useEffect, useState } from "react";
import {
  settingService,
  Sequence,
  AcademicYear,
  Term,
} from "@/lib/services/settingService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Trash, Plus, AlertCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

const SequenceManagement: React.FC = () => {
  const { t } = useTranslation();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentTerms, setCurrentTerms] = useState<Term[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Sequence>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    academicYear: "",
    term: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSequences();
    loadTerms();
    loadAcademicYear();
  }, []);

  const loadSequences = async () => {
    try {
      const data = await settingService.getSequences();
      setSequences(data);
    } catch (error) {
      console.error('Error loading sequences:', error);
      setError(t('school.settings.seq.error.load'));
      toast({ 
        variant: "destructive", 
        description: t('school.settings.seq.error.load') 
      });
    }
  };

  const loadAcademicYear = async () => {
    try {
      const data = await settingService.getAcademicYears();
      setAcademicYears(data);
      if (data.length > 0 && filter.academicYear === "") {
        setFilter({ ...filter, academicYear: data[data.length - 1].name });
        setCurrentTerms(data[data.length - 1].terms);
      }
    } catch (error) {
      console.error('Error loading academic years:', error);
      setError(t('school.settings.seq.error.loadYear'));
      toast({ 
        variant: "destructive", 
        description: t('school.settings.seq.error.loadYear') 
      });
    }
  };

  const loadTerms = async () => {
    try {
      const data = await settingService.getTerms();
      setTerms(data);
    } catch (error) {
      console.error('Error loading terms:', error);
      setError(t('school.settings.seq.error.loadTerm'));
      toast({ 
        variant: "destructive", 
        description: t('school.settings.seq.error.loadTerm') 
      });
    }
  };

  const resetForm = () => {
    setForm({
      startDate: "",
      endDate: "",
      term: "",
      name: "",
    });
    setEditingId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (editingId) {
        await settingService.updateSequence(editingId, form);
        toast({ 
          title: t('school.settings.seq.success.update'), 
          variant: "default" 
        });
      } else {
        await settingService.createSequence(form as Sequence);
        toast({ 
          title: t('school.settings.seq.success.create'), 
          variant: "default" 
        });
      }
      await loadSequences();
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Error saving sequence:', error);
      setError(t('school.settings.seq.error.save'));
      toast({
        title: t('school.settings.seq.error.title'),
        description: t('school.settings.seq.error.general'),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (sequence: Sequence) => {
    setForm(sequence);
    setEditingId(sequence._id ?? null);
    setOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!window.confirm(t('school.settings.seq.confirm.delete'))) return;
    if (!id) return;
    setError(null);
    try {
      await settingService.deleteSequence(id);
      toast({ 
        title: t('school.settings.seq.success.delete'), 
        variant: "default" 
      });
      await loadSequences();
    } catch (error) {
      console.error('Error deleting sequence:', error);
      setError(t('school.settings.seq.error.delete'));
      toast({
        variant: "destructive",
        description: t('school.settings.seq.error.delete'),
      });
    }
  };

  const changeStatus = async (id: string, currentStatus: boolean) => {
    setError(null);
    try {
      await settingService.updateSequence(id, {
        isActive: !currentStatus,
      });
      toast({ 
        description: t(`school.settings.seq.status.${!currentStatus ? 'active' : 'inactive'}`), 
        variant: "default" 
      });
      loadSequences();
    } catch (error) {
      console.error('Error changing sequence status:', error);
      setError(t('school.settings.seq.error.status'));
      toast({
        variant: "destructive",
        description: t('school.settings.seq.error.status'),
      });
    }
  };

  const filteredTerms = sequences
    .filter((seq) => currentTerms.some((opt) => opt._id === seq.term._id))
    .filter((seq) => (filter.term ? seq.term._id === filter.term : true));

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-semibold">
            {t('school.settings.seq.title')}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
            {/* Academic Year Filter */}
            <select
              required
              value={filter.academicYear}
              onChange={(e) => {
                const yearId = e.target.value;
                setFilter({ ...filter, academicYear: yearId, term: "" });
                setCurrentTerms(
                  academicYears.find((opt) => opt.name === yearId)?.terms || []
                );
              }}
              className="w-full sm:w-auto border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skyblue"
            >
              <option value="" disabled>
                {t('school.settings.seq.selectYear')}
              </option>
              {academicYears.map((year) => (
                <option key={year._id} value={year.name}>
                  {year.name}
                </option>
              ))}
            </select>

            {/* Term Filter */}
            <select
              required
              value={filter.term || ""}
              onChange={(e) => {
                setFilter({ ...filter, term: e.target.value });
              }}
              className="w-full sm:w-auto border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skyblue"
            >
              <option value="">{t('school.settings.seq.allTerms')}</option>
              {currentTerms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>

            {/* Add Sequence Button */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> 
                  {t('school.settings.seq.add')}
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  {editingId 
                    ? t('school.settings.seq.edit') 
                    : t('school.settings.seq.new')}
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Sequence Name */}
                  <div>
                    <Label>{t('school.settings.seq.name')}</Label>
                    <select
                      name="name"
                      required
                      value={form.name}
                      onChange={handleInputChange}
                      className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="" disabled>
                        {t('school.settings.seq.selectSeq')}
                      </option>
                      <option value="Sequence 1">{t('school.settings.seq.seq1')}</option>
                      <option value="Sequence 2">{t('school.settings.seq.seq2')}</option>
                      <option value="Sequence 3">{t('school.settings.seq.seq3')}</option>
                      <option value="Sequence 4">{t('school.settings.seq.seq4')}</option>
                    </select>
                  </div>

                  {/* Start and End Date */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label>{t('school.settings.seq.startDate')}</Label>
                      <Input
                        name="startDate"
                        type="date"
                        value={form.startDate || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Label>{t('school.settings.seq.endDate')}</Label>
                      <Input
                        name="endDate"
                        type="date"
                        value={form.endDate || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Academic Year and Term Select */}
                  {!editingId && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Label>{t('school.settings.seq.academicYear')}</Label>
                        <select
                          name="year"
                          value={filter.academicYear}
                          onChange={(e) => {
                            const yearId = e.target.value;
                            setFilter({
                              ...filter,
                              academicYear: yearId,
                              term: "",
                            });
                            setCurrentTerms(
                              academicYears.find((opt) => opt.name === yearId)
                                ?.terms || []
                            );
                            setForm((prev) => ({
                              ...prev,
                              term: "",
                            }));
                          }}
                          required
                          className="border px-3 py-2 w-full rounded"
                        >
                          <option value="">{t('school.settings.seq.selectYear')}</option>
                          {academicYears.map((year) => (
                            <option key={year._id} value={year.name}>
                              {year.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1">
                        <Label>{t('school.settings.seq.term')}</Label>
                        <select
                          name="term"
                          value={form.term || ""}
                          onChange={handleInputChange}
                          required
                          disabled={!currentTerms.length}
                          className="border px-3 py-2 w-full rounded"
                        >
                          <option value="">{t('school.settings.seq.selectTerm')}</option>
                          {currentTerms.map((term) => (
                            <option key={term._id} value={term._id}>
                              {term.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button onClick={handleSubmit} className="w-full sm:w-auto">
                    {editingId 
                      ? t('school.settings.seq.update') 
                      : t('school.settings.seq.create')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
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

      <table className="min-w-full border text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2 border">{t('school.settings.seq.name')}</th>
            <th className="px-3 py-2 border">{t('school.settings.seq.startDate')}</th>
            <th className="px-3 py-2 border">{t('school.settings.seq.endDate')}</th>
            <th className="px-3 py-2 border">{t('school.settings.seq.term')}</th>
            <th className="px-3 py-2 border">{t('school.settings.seq.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredTerms.length > 0 ? (
            filteredTerms.map((seq) => (
              <tr key={seq._id}>
                <td className="border px-3 py-2">{seq.name}</td>
                <td className="border px-3 py-2">
                  {seq.startDate?.slice(0, 10)}
                </td>
                <td className="border px-3 py-2">{seq.endDate?.slice(0, 10)}</td>
                <td className="border px-3 py-2">{seq?.term?.name || "N/A"}</td>
                <td className="border px-3 py-2 flex items-center space-x-2">
                  <Label className="relative inline-flex items-center cursor-pointer mt-2">
                    <Input
                      type="checkbox"
                      className="sr-only peer"
                      checked={seq.isActive}
                      onChange={() => changeStatus(seq._id!, seq.isActive)}
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full peer-checked:translate-x-5 transition"></div>
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(seq)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(seq._id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="border px-3 py-2 text-center">
                {t('school.settings.seq.empty')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SequenceManagement;