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
import { Pencil, Trash, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SequenceManagement: React.FC = () => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentTerms, setCurrentTerms] = useState<Term[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Sequence>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
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
    const data = await settingService.getSequences();
    setSequences(data);
  };
  const loadAcademicYear = async () => {
    const data = await settingService.getAcademicYears();
    setAcademicYears(data);
    if (data.length > 0 && filter.academicYear === "") {
      setFilter({ ...filter, academicYear: data[data.length - 1].name });
      setCurrentTerms(data[data.length - 1].terms);
      console.log(data[data.length - 1].name);
    }
  };
  const loadTerms = async () => {
    const data = await settingService.getTerms();
    console.log(data);
    setTerms(data);
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
    try {
      if (editingId) {
        await settingService.updateSequence(editingId, form);
        toast({ title: "Sequence updated successfully" });
      } else {
        await settingService.createSequence(form as Sequence);
        toast({ title: "Sequence created successfully" });
      }
      await loadSequences();
      resetForm();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
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
    if (!window.confirm("Are you sure you want to delete this Sequence?"))
      return;
    try {
      await settingService.deleteSequence(id);
      toast({ title: "Sequence deleted" });
      await loadSequences();
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to delete Sequence.",
      });
    }
    if (!id) return;
  };
  const changeStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = currentStatus ? "inactive" : "active";
    try {
      await settingService.updateSequence(id, {
        isActive: !currentStatus,
      });
      toast({ description: `Status changed to ${newStatus}.` });
      loadSequences();
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to update status.",
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
          <h2 className="text-2xl font-semibold">Manage Sequences</h2>
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
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Academic Year
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
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Terms</option>
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
                  <Plus className="w-4 h-4 mr-2" /> Add Sequence
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  {editingId ? "Edit Sequence" : "New Sequence"}
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Sequence Name */}
                  <div>
                    <Label>Name</Label>
                    <select
                      name="name"
                      required
                      value={form.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Select a Sequence
                      </option>
                      <option value="Sequence 1">Sequence 1</option>
                      <option value="Sequence 2">Sequence 2</option>
                      <option value="Sequence 3">Sequence 3</option>
                      <option value="Sequence 4">Sequence 4</option>
                    </select>
                  </div>

                  {/* Start and End Date */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label>Start Date</Label>
                      <Input
                        name="startDate"
                        type="date"
                        value={form.startDate || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Label>End Date</Label>
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
                        <Label>Academic Year</Label>
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
                          <option value="">Select Year</option>
                          {academicYears.map((year) => (
                            <option key={year._id} value={year.name}>
                              {year.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1">
                        <Label>Term</Label>
                        <select
                          name="term"
                          value={form.term || ""}
                          onChange={handleInputChange}
                          required
                          disabled={!currentTerms.length}
                          className="border px-3 py-2 w-full rounded"
                        >
                          <option value="">Select a Term</option>
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
                    {editingId ? "Update Sequence" : "Create Sequence"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 border">Name</th>
            <th className="px-3 py-2 border">Start</th>
            <th className="px-3 py-2 border">End</th>
            <th className="px-3 py-2 border">Term</th>
            <th className="px-3 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTerms.map((seq) => (
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
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
                  {/* <span className="ml-3 text-sm font-medium text-gray-900">
                                                  {form.isCurrent ? "Active" : "Inactive"}
                                                </span> */}
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
                  className="text-red-600"
                  onClick={() => handleDelete(seq._id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SequenceManagement;
