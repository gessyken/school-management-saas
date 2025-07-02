import React, { useEffect, useState } from "react";
import { settingService, AcademicYear } from "@/lib/services/settingService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Pencil, Trash, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

const AcademicYearManagement = () => {
  const { toast } = useToast();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<AcademicYear | null>(null);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: true, // default to active
  });

  // Fetch all academic years
  const fetchAcademicYears = async () => {
    try {
      const data = await settingService.getAcademicYears();
      console.log(data);
      setAcademicYears(data);
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to fetch academic years.",
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
    try {
      if (editItem && editItem._id) {
        await settingService.updateAcademicYear(editItem._id, form);
        toast({ description: "Academic year updated successfully." });
      } else {
        await settingService.createAcademicYear(form);
        toast({ description: "Academic year created successfully." });
      }
      setDialogOpen(false);
      resetForm();
      fetchAcademicYears();
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to save academic year.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this academic year?"))
      return;
    try {
      await settingService.deleteAcademicYear(id);
      toast({ description: "Academic year deleted successfully." });
      fetchAcademicYears();
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to delete academic year.",
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

  // Filter academic years by search term
  const filteredAcademicYears = academicYears.filter((ay) =>
    ay.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentYear = new Date().getFullYear();

  // Generate options from (currentYear - 5) to (currentYear + 5)
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    years.push(`${y}-${y + 1}`);
  }

  const changeStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = currentStatus ? "inactive" : "active";
    try {
      await settingService.updateAcademicYear(id, {
        isCurrent: !currentStatus,
      });
      toast({ description: `Status changed to ${newStatus}.` });
      fetchAcademicYears(); // refresh list
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
        <CardTitle className="text-xl font-bold">Academic Years</CardTitle>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            placeholder="Search academic years..."
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
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {filteredAcademicYears.length === 0 && (
          <p className="text-center text-muted-foreground">
            No academic years found.
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
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
                {/* <span className="ml-3 text-sm font-medium text-gray-900">
                  {form.isCurrent ? "Active" : "Inactive"}
                </span> */}
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
              {editItem ? "Edit Academic Year" : "Add Academic Year"}
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            >
              <option value="" disabled>
                Select Academic Year
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
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {form.isCurrent ? "Active" : "Inactive"}
              </span>
            </Label>

            <Input
              required
              type="date"
              placeholder="Start Date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              required
              type="date"
              placeholder="End Date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editItem ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AcademicYearManagement;
