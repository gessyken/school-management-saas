import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout"; // Assuming AppLayout is still used higher up
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  FileSpreadsheet,
  Pencil,
  Eye,
  Trash,
  FilePlus,
  Upload,
  Download,
  CheckCircle,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from "lucide-react";
import { Info, BookOpen, Code2, XCircle, AlertCircle } from "lucide-react";
import { subjectService } from "@/lib/services/subjectService";
import { useToast } from "@/components/ui/use-toast";
import { usePagination } from "@/components/ui/usePagination";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CameroonSubjectsImporter from "@/components/CameroonSubjectsImporter";
import { useTranslation } from "react-i18next";

// Subject interface/type
interface Subject {
  _id?: string;
  school?: string; // Added school for completeness, though not directly used here
  subjectCode: string;
  subjectName: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const itemsPerPage = 5;

// Simple custom confirmation modal component
const ConfirmationModal = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
      <div className="bg-background rounded-lg p-6 max-w-sm w-full shadow-lg">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Subjects = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [subjects, setSubjects] = useState<Subject[]>([]); // This will hold ALL subjects fetched from backend
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and Sort states for frontend manipulation
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<keyof Subject | ''>('subjectName'); // Default sort by name
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default ascending

  // Modal state
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Form state for create/edit
  const [form, setForm] = useState<Subject>({
    subjectCode: "",
    subjectName: "",
    description: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch all subjects (no backend search/filter/sort parameters)
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend now only serves all subjects for the school, frontend handles search/filter/sort
      const res = await subjectService.getAll();
      setSubjects(res.data.subjects || []);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setError(t('subject.fetch_error_message'));
      setSubjects([]);
      toast({
        title: t('common.error'),
        description: t('subject.fetch_error_toast_description'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]); // Dependencies only include t and toast now, no debouncedSearch

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Memoized filtered and sorted subjects for frontend rendering
  const filteredAndSortedSubjects = useMemo(() => {
    let result = [...subjects]; // Start with a copy of all fetched subjects

    // 0. Apply search filter
    if (debouncedSearch) {
      const lowerCaseSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.subjectName.toLowerCase().includes(lowerCaseSearch) ||
          s.subjectCode.toLowerCase().includes(lowerCaseSearch) ||
          s.description?.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // 1. Apply filter by status
    if (filterStatus !== 'all') {
      result = result.filter(s => s.isActive === (filterStatus === 'active'));
    }

    // 2. Apply sort
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        // Handle null/undefined values for comparison gracefully
        // null/undefined values typically go to the end for ascending sort, or beginning for descending
        if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        // For boolean or potentially numbers (if added)
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [subjects, debouncedSearch, filterStatus, sortBy, sortOrder]); // Add debouncedSearch to dependencies

  // Pagination now uses the filteredAndSortedSubjects
  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filteredAndSortedSubjects, itemsPerPage);

  // Reset to first page when filters/sorts/search change
  useEffect(() => {
    goToPage(1);
  }, [filteredAndSortedSubjects, goToPage]);


  // Handle Import from Excel
  const handleImport = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const bstr = e.target?.result;
        if (!bstr) throw new Error("File reading failed");
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        await subjectService.bulkImport(data);
        toast({
          title: t('common.import_success_title'),
          description: t('subject.import_success_toast_description'),
          variant: "default"
        });
        fetchSubjects(); // Refetch all subjects to update the list
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Failed to import subjects:", error);
      setError(t('subject.import_error_message'));
      toast({
        title: t('common.error'),
        description: t('subject.import_failed_toast_description'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Export Excel (uses the full `subjects` array, not just visible `currentData`)
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(subjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");
    XLSX.writeFile(wb, "subjects.xlsx");
  };

  // Export PDF (uses the full `subjects` array, not just visible `currentData`)
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(t('subject.pdf_title'), 14, 20);
    const date = new Date().toLocaleDateString("fr-FR"); // Consider localizing date format if needed
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t('subject.pdf_export_date')} : ${date}`, 14, 28);
    const tableColumn = [
      t('subject.table_name'),
      t('subject.table_code'),
      t('subject.table_status'),
      t('subject.table_description')
    ];
    const tableRows = subjects.map((s) => [
      s.subjectName,
      s.subjectCode,
      s.isActive ? t('subject.active_status') : t('subject.inactive_status'),
      s.description || "-",
    ]);
    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      styles: { halign: "left", valign: "middle" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 },
    });
    doc.save(`matieres_${date.replace(/\//g, "-")}.pdf`);
  };

  // Open modal for create/edit/view
  const openModal = (mode: "view" | "edit" | "create", subject: Subject | null = null) => {
    setSelectedSubject(subject);
    setModalMode(mode);
    if (mode === "create") {
      setForm({ subjectCode: "", subjectName: "", description: "", isActive: true });
      setEditingId(null);
    } else if (subject) {
      setForm(subject);
      setEditingId(subject._id ?? null);
    }
    setIsModalOpen(true);
  };

  // Close modal and reset states
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubject(null);
    setModalMode(null);
    setEditingId(null);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (editingId) {
        await subjectService.update(editingId, form);
        toast({ title: t('subject.update_success_toast'), variant: "default" });
      } else {
        await subjectService.create(form);
        toast({ title: t('subject.create_success_toast'), variant: "default" });
      }
      fetchSubjects(); // Re-fetch to update the main subjects list
      closeModal();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      const errorMessage = error.response?.data?.message || t('subject.save_error_message');
      setError(errorMessage);
      toast({
        title: t('common.error'),
        description: t('subject.save_error_toast_description'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle active status
  const toggleActive = async (subject: Subject) => {
    setError(null);
    setLoading(true);
    try {
      await subjectService.update(subject._id!, { isActive: !subject.isActive });
      toast({
        title: subject.isActive ? t('subject.deactivate_success_toast') : t('subject.activate_success_toast'),
        description: subject.isActive ? t('subject.deactivate_success_description', { name: subject.subjectName }) : t('subject.activate_success_description', { name: subject.subjectName }),
        variant: "default"
      });
      fetchSubjects(); // Re-fetch to update the main subjects list
    } catch (error) {
      console.error('Error toggling subject status:', error);
      setError(t('subject.toggle_status_error_message'));
      toast({
        title: t('common.error'),
        description: t('subject.toggle_status_error_toast_description'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal for deletion
  const confirmDelete = (subject: Subject) => {
    setSubjectToDelete(subject);
    setConfirmOpen(true);
  };

  // Delete subject after confirmation
  const handleDeleteConfirmed = async () => {
    if (!subjectToDelete?._id) return;
    setError(null);
    setLoading(true);
    try {
      await subjectService.remove(subjectToDelete._id);
      toast({ title: t('subject.delete_success_toast'), variant: "default" });
      fetchSubjects(); // Re-fetch to update the main subjects list
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError(t('subject.delete_error_message'));
      toast({
        title: t('common.error'),
        description: t('subject.delete_error_toast_description'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setSubjectToDelete(null);
    }
  };

  return (
    // <AppLayout> // If AppLayout wraps the entire page, it should be done in a parent route.
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('subject.management_title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('subject.total_subjects')}
            </CardTitle>
            <div className="text-2xl font-bold">{subjects.length}</div>
          </CardHeader>
        </Card>

        <Card className="bg-skyblue/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('subject.active_subjects')}
            </CardTitle>
            <div className="text-2xl font-bold">
              {subjects.filter((s) => s.isActive).length}
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-skyblue/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('subject.inactive_subjects')}
            </CardTitle>
            <div className="text-2xl font-bold">
              {subjects.filter((s) => !s.isActive).length}
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-6">
        <CameroonSubjectsImporter onImportComplete={fetchSubjects} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <Input
            placeholder={t('subject.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
            disabled={loading}
          />
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Status */}
            <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('subject.filter_status_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('subject.filter_status_all')}</SelectItem>
                <SelectItem value="active">{t('subject.filter_status_active')}</SelectItem>
                <SelectItem value="inactive">{t('subject.filter_status_inactive')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By Field */}
            <Select value={sortBy} onValueChange={(value: keyof Subject) => setSortBy(value)} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('subject.sort_by_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subjectName">{t('subject.sort_by_name')}</SelectItem>
                <SelectItem value="subjectCode">{t('subject.sort_by_code')}</SelectItem>
                <SelectItem value="createdAt">{t('subject.sort_by_created')}</SelectItem>
                <SelectItem value="updatedAt">{t('subject.sort_by_updated')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)} disabled={loading}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('subject.sort_order_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  <span className="flex items-center"><ArrowUpNarrowWide className="h-4 w-4 mr-2" /> {t('subject.sort_order_asc')}</span>
                </SelectItem>
                <SelectItem value="desc">
                  <span className="flex items-center"><ArrowDownWideNarrow className="h-4 w-4 mr-2" /> {t('subject.sort_order_desc')}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 mb-4">
          <Button onClick={() => openModal("create")} disabled={loading}>
            <FilePlus className="mr-2 h-4 w-4" />
            {t('subject.add_button')}
          </Button>
          <Button variant="outline" onClick={exportExcel} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {t('subject.export_excel')}
          </Button>
          <Button variant="outline" onClick={exportPDF} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {t('subject.export_pdf')}
          </Button>
          <label className="cursor-pointer bg-muted px-3 py-1 rounded">
            <Upload className="inline h-4 w-4 mr-2" />
            {t('subject.import_excel_button')}
            <input
              type="file"
              hidden
              onChange={(e) => e.target.files && handleImport(e.target.files[0])}
              disabled={loading}
              accept=".xls,.xlsx"
            />
          </label>
        </div>

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

        {loading ? (
          <p>{t('subject.loading_message')}</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('subject.table_name')}</TableHead>
                  <TableHead>{t('subject.table_code')}</TableHead>
                  <TableHead>{t('subject.table_status')}</TableHead>
                  <TableHead>{t('subject.table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((subject: Subject) => (
                    <TableRow key={subject._id}>
                      <TableCell>{subject.subjectName}</TableCell>
                      <TableCell>{subject.subjectCode}</TableCell>
                      <TableCell>
                        <CheckCircle
                          className={`h-4 w-4 ${subject.isActive ? "text-primary" : "text-destructive"
                            }`}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={loading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openModal("view", subject)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('subject.view_action')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openModal("edit", subject)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t('subject.edit_action')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(subject)}>
                              {subject.isActive ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {t('subject.deactivate_action')}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {t('subject.activate_action')}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmDelete(subject)}
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              {t('subject.delete_action')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {t('subject.no_subjects_found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={goToPreviousPage}
                disabled={currentPage === 1 || loading}
              >
                {t('subject.previous_button')}
              </Button>
              <div>
                {t('subject.page_info', { current: currentPage, total: totalPages })}
              </div>
              <Button
                variant="outline"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || loading}
              >
                {t('subject.next_button')}
              </Button>
            </div>
          </>
        )}
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4 capitalize">
              {modalMode === "create"
                ? t('subject.add_modal_title')
                : modalMode === "edit"
                  ? t('subject.edit_modal_title')
                  : t('subject.view_modal_title')}
            </h2>

            {(modalMode === "create" || modalMode === "edit") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-semibold">{t('subject.name_label')}</label>
                  <Input
                    type="text"
                    value={form.subjectName}
                    onChange={(e) =>
                      setForm({ ...form, subjectName: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">{t('subject.code_label')}</label>
                  <Input
                    type="text"
                    value={form.subjectCode}
                    onChange={(e) =>
                      setForm({ ...form, subjectCode: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold">{t('subject.description_label')}</label>
                  <textarea
                    className="w-full border-border rounded px-3 py-2"
                    value={form.description || ''}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    disabled={loading}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    disabled={loading}
                  />
                  <label htmlFor="isActive">{t('subject.active_label')}</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {t('subject.save_button')}
                  </Button>
                </div>
              </form>
            )}

            {modalMode === "view" && selectedSubject && (
              <div className="space-y-4">
                <div>
                  <strong>{t('subject.name_label')}:</strong> {selectedSubject.subjectName}
                </div>
                <div>
                  <strong>{t('subject.code_label')}:</strong> {selectedSubject.subjectCode}
                </div>
                <div>
                  <strong>{t('subject.description_label')}:</strong> {selectedSubject.description || "-"}
                </div>
                <div>
                  <strong>{t('subject.status_label')}:</strong>{" "}
                  {selectedSubject.isActive ? t('subject.active_status') : t('subject.inactive_status')}
                </div>
                <div className="flex justify-end">
                  <Button onClick={closeModal}>{t('subject.close_button')}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        message={t('subject.delete_confirmation', { name: subjectToDelete?.subjectName ?? "" })}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
    // </AppLayout>
  );
};

export default Subjects;