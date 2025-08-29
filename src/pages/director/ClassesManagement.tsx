import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  FilePlus,
  Download,
  Upload,
  CheckCircle,
  Pencil,
  Trash,
  AlertCircle,
  XCircle,
  Loader2,
  GraduationCap,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { usePagination } from "@/components/ui/usePagination";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { classService, SchoolClass } from "@/lib/services/classService";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { subjectService } from "@/lib/services/subjectService";
import { userService } from "@/lib/services/userService";
import ClassesGroupedView from "@/components/ClassesGroupedView";
import {
  getAllLevelsStructured, // Use the structured levels from cameroonSubjects
  SubjectData as CameroonSubjectData // Alias to avoid conflict with local SubjectItem
} from "@/data/cameroonSubjects";

interface SubjectItem {
  _id: string;
  subjectName: string;
  subjectCode: string; // Add subjectCode for lookup
}
interface TeacherItem {
  _id: string;
  fullName: string;
}
interface ClassSubject {
  subjectInfo: string;
  coefficient: number | "";
  teacherInfo?: string; // teacherInfo is optional in schema
}

const itemsPerPage = 5;

// Simple custom confirmation modal component (already translated)
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


const ClassesManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<string>('all'); // New state for year filter

  const [subjects, setSubjects] = useState<SubjectItem[]>([]); // All subjects available in the school
  const [teachers, setTeachers] = useState<TeacherItem[]>([]); // All teachers available in the school

  const allCameroonLevels = getAllLevelsStructured(); // Get structured levels from data file

  // Default subjects for quick creation, using translation keys
  const defaultSubjects: Record<'francophone' | 'anglophone', { name: string, code: string, coefficient: number }[]> = useMemo(() => ({
    francophone: [
      { name: t('classes.subjects.french'), code: 'FR', coefficient: 4 },
      { name: t('classes.subjects.math'), code: 'MATH', coefficient: 4 },
      { name: t('classes.subjects.english'), code: 'ANG', coefficient: 3 },
      { name: t('classes.subjects.history_geo'), code: 'HG', coefficient: 3 },
      { name: t('classes.subjects.physics_chem'), code: 'PC', coefficient: 3 },
      { name: t('classes.subjects.biology_geology'), code: 'SVT', coefficient: 3 },
      { name: t('classes.subjects.pe'), code: 'EPS', coefficient: 2 },
      { name: t('classes.subjects.arts'), code: 'AP', coefficient: 2 },
      { name: t('classes.subjects.music'), code: 'MUS', coefficient: 2 }
    ],
    anglophone: [
      { name: t('classes.subjects.english_lang'), code: 'ENG', coefficient: 4 },
      { name: t('classes.subjects.math'), code: 'MATHS', coefficient: 4 },
      { name: t('classes.subjects.french'), code: 'FRENCH', coefficient: 3 },
      { name: t('classes.subjects.history'), code: 'HIST', coefficient: 3 },
      { name: t('classes.subjects.geography'), code: 'GEOG', coefficient: 3 },
      { name: t('classes.subjects.biology'), code: 'BIO', coefficient: 3 },
      { name: t('classes.subjects.chemistry'), code: 'CHEM', coefficient: 3 },
      { name: t('classes.subjects.physics'), code: 'PHYS', coefficient: 3 },
      { name: t('classes.subjects.pe'), code: 'PE', coefficient: 2 },
      { name: t('classes.subjects.arts'), code: 'ART', coefficient: 2 }
    ]
  }), [t]);


  const [form, setForm] = useState<Omit<SchoolClass, "_id"> & { subjects: ClassSubject[] }>({
    classesName: "",
    description: "",
    status: "Open",
    capacity: 30,
    amountFee: "",
    level: "",
    subjects: [],
    studentList: [], // studentList is managed by separate endpoints
    mainTeacherInfo: undefined, // ensure it's undefined initially if not set
    year: "",
  });
  const [educationSystem, setEducationSystem] = useState<'francophone' | 'anglophone'>('francophone');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quickCreateForm, setQuickCreateForm] = useState({
    level: '',
    sections: ['A', 'B'], // Default sections
    year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    capacity: 30,
    amountFee: 0,
    addDefaultSubjects: true
  });
  const educationSystemForLevel = allCameroonLevels.francophone.includes(quickCreateForm.level) ? 'francophone' : 'anglophone';

  // Helper to generate a default academic year
  const generateAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}-${nextYear}`;
  };

  // Memoized list of unique academic years for the filter dropdown
  const uniqueAcademicYears = useMemo(() => {
    const years = new Set<string>();
    classes.forEach(cls => {
      if (cls.year) {
        years.add(cls.year);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending for most recent first
  }, [classes]);


  // Frontend filtering logic
  const filteredClasses = useMemo(() => {
    let result = classes;

    // Apply search filter
    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      result = result.filter((cls) =>
        cls.classesName.toLowerCase().includes(lowerCaseSearch) ||
        cls.level.toLowerCase().includes(lowerCaseSearch) ||
        cls.year.toLowerCase().includes(lowerCaseSearch) ||
        cls.description?.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Apply year filter
    if (filterYear !== 'all' && filterYear) {
      result = result.filter(cls => cls.year === filterYear);
    }

    return result;
  }, [classes, search, filterYear]); // Add filterYear to dependencies

  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filteredClasses, "all");
  console.log(currentData)
  // Reset pagination when filters change
  useEffect(() => {
    goToPage(1);
  }, [filteredClasses, goToPage]);


  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await classService.getAll(); // No params here, frontend filters
      setClasses(res.data.classes || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setError(t('classes.errors.load_classes_failed'));
      toast({
        title: t('common.error'),
        description: t('classes.errors.load_classes_toast'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await subjectService.getAll(); // No params needed if frontend filters
      setSubjects(res.data.subjects || []);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
      toast({
        title: t('common.error'),
        description: t('classes.errors.load_subjects_toast'),
        variant: "destructive",
      });
    }
  }, [toast, t]);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await userService.getAll({ roles: "TEACHER" }); // Assuming backend can filter by roles
      // Format teacher names for display if needed
      setTeachers(res.data.users?.map((user: any) => ({
        _id: user._id,
        fullName: `${user.firstName} ${user.lastName}` // Assuming User model has firstName, lastName
      })) || []);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setTeachers([]);
      toast({
        title: t('common.error'),
        description: t('classes.errors.load_teachers_toast'),
        variant: "destructive",
      });
    }
  }, [toast, t]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, [fetchClasses, fetchSubjects, fetchTeachers]);

  const resetForm = () => {
    setForm({
      classesName: "", // No random generation for specific classes anymore, user inputs
      description: "",
      status: "Open",
      capacity: 30,
      amountFee: "",
      level: "",
      subjects: [],
      studentList: [],
      mainTeacherInfo: undefined,
      year: generateAcademicYear(),
    });
    setEducationSystem('francophone');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Frontend validation
    if (!form.classesName.trim()) {
      setError(t('classes.errors.class_name_required'));
      setSubmitting(false);
      return;
    }
    if (!form.level) {
      setError(t('classes.errors.level_required'));
      setSubmitting(false);
      return;
    }
    if (!form.year || !/^\d{4}-\d{4}$/.test(form.year)) {
      setError(t('classes.errors.year_format_invalid'));
      setSubmitting(false);
      return;
    }
    if (form.subjects.some((s) => !s.subjectInfo || s.coefficient === "" || s.coefficient === undefined || !s.teacherInfo)) {
      setError(t('classes.errors.subject_details_required'));
      setSubmitting(false);
      return;
    }

    // Prepare data, ensuring numbers are parsed
    const classDataToSend = {
      ...form,
      capacity: form.capacity === "" ? undefined : Number(form.capacity),
      amountFee: form.amountFee === "" ? undefined : Number(form.amountFee),
      subjects: form.subjects.map(s => ({
        ...s,
        coefficient: s.coefficient === "" ? 1 : Number(s.coefficient), // Default to 1 if empty
        teacherInfo: s.teacherInfo || undefined // ensure empty string becomes undefined
      })),
      mainTeacherInfo: form.mainTeacherInfo || undefined // ensure empty string becomes undefined
    };

    try {
      if (editingId) {
        await classService.update(editingId, classDataToSend);
        toast({
          title: t('classes.success.update_title'),
          description: t('classes.success.update_description'),
          variant: "default"
        });
      } else {
        await classService.create(classDataToSend);
        toast({
          title: t('classes.success.create_title'),
          description: t('classes.success.create_description'),
          variant: "default"
        });
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchClasses();
    } catch (error: any) {
      console.error("Failed to save class:", error);
      let errorMessage = t('classes.errors.save_failed_generic');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!quickCreateForm.level) {
      toast({
        title: t('common.error'),
        description: t('classes.errors.level_required_qc'),
        variant: "destructive"
      });
      return;
    }
    if (!quickCreateForm.year || !/^\d{4}-\d{4}$/.test(quickCreateForm.year)) {
      toast({
        title: t('common.error'),
        description: t('classes.errors.year_format_invalid_qc'),
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    let createdCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {

      let subjectsToAdd: ClassSubject[] = [];
      if (quickCreateForm.addDefaultSubjects) {
        const defaultSubjectsForSystem = defaultSubjects[educationSystemForLevel];

        for (const defaultSubj of defaultSubjectsForSystem) {
          // Try to find existing subject by name or code first
          let existingSubject = subjects.find(s =>
            s.subjectName === defaultSubj.name || s.subjectCode === defaultSubj.code
          );

          if (!existingSubject) {
            try {
              // If not found, create it
              const newSubjectRes = await subjectService.create({
                subjectName: defaultSubj.name,
                subjectCode: defaultSubj.code,
                description: `${t('classes.subjects.default_desc', { subjectName: defaultSubj.name })}`,
                isActive: true
              });
              existingSubject = {
                _id: newSubjectRes.subject._id, // Assuming newSubjectRes.subject is the created subject
                subjectName: newSubjectRes.subject.subjectName,
                subjectCode: newSubjectRes.subject.subjectCode
              };
              // Update local subjects list
              setSubjects(prev => [...prev, existingSubject!]);
            } catch (err: any) {
              // If subject creation fails (e.g., duplicate code on backend)
              if (err.response?.data?.message?.includes('E11000 duplicate key error') || err.response?.data?.message?.includes('duplicate subject code')) {
                // Try to find it again, assuming it was created by another process or concurrent request
                const foundAgain = await subjectService.getAll({ search: defaultSubj.name });
                if (foundAgain.data.subjects && foundAgain.data.subjects.length > 0) {
                  existingSubject = foundAgain.data.subjects[0];
                  // Update local subjects list if it's new to us
                  if (!subjects.some(s => s._id === existingSubject!._id)) {
                    setSubjects(prev => [...prev, existingSubject!]);
                  }
                } else {
                  console.warn(`Failed to create/find subject ${defaultSubj.name}:`, err);
                  errors.push(t('classes.errors.add_default_subject_failed', { name: defaultSubj.name }));
                  continue; // Skip this subject
                }
              } else {
                console.warn(`Failed to create subject ${defaultSubj.name}:`, err);
                errors.push(t('classes.errors.add_default_subject_failed', { name: defaultSubj.name }));
                continue; // Skip this subject
              }
            }
          }
          subjectsToAdd.push({
            subjectInfo: existingSubject!._id,
            coefficient: defaultSubj.coefficient,
            teacherInfo: undefined // No teacher assigned by default during quick create
          });
        }
      }

      for (const section of quickCreateForm.sections) {
        const className = `${quickCreateForm.level}${section}`;
        const classDataToSend: Omit<SchoolClass, "_id"> = {
          classesName: className,
          description: `${t('classes.class_of')} ${quickCreateForm.level} ${t('classes.section')} ${section}`,
          status: "Open",
          capacity: Number(quickCreateForm.capacity),
          level: quickCreateForm.level,
          amountFee: Number(quickCreateForm.amountFee),
          year: quickCreateForm.year,
          subjects: subjectsToAdd,
          studentList: [], // Initially empty
          mainTeacherInfo: undefined, // Initially no main teacher
        };

        try {
          console.log(classDataToSend)
          await classService.create(classDataToSend);
          createdCount++;
        } catch (error: any) {
          failedCount++;
          let errorMessage = `Failed to create class ${className}.`;
          if (error.response?.data?.message?.includes('E11000 duplicate key error') || error.response?.data?.message?.includes('duplicate class name')) {
            errorMessage = t('classes.errors.duplicate_class_entry', { className, year: quickCreateForm.year });
          } else if (error.response?.data?.message) {
            errorMessage = `Failed to create class ${className}: ${error.response.data.message}`;
          }
          errors.push(errorMessage);
          console.error(errorMessage, error);
        }
      }

      if (createdCount > 0) {
        toast({
          title: t('classes.success.quick_create_title', { count: createdCount }),
          description: t('classes.success.quick_create_description', { created: createdCount, failed: failedCount }),
          variant: failedCount > 0 ? "warning" : "default"
        });
        fetchClasses(); // Refresh the class list
      } else {
        toast({
          title: t('common.error'),
          description: t('classes.errors.quick_create_all_failed'),
          variant: "destructive"
        });
      }

      if (errors.length > 0) {
        setError(errors.join('\n')); // Display all aggregated errors
      }

      setShowQuickCreateModal(false);
      // Reset quick create form
      setQuickCreateForm({
        level: '',
        sections: ['A', 'B'],
        year: generateAcademicYear(),
        capacity: 30,
        amountFee: 0,
        addDefaultSubjects: true
      });

    } catch (error) {
      console.error("Quick create overall error:", error);
      setError(t('classes.errors.quick_create_overall_failed'));
      toast({
        title: t('common.error'),
        description: t('classes.errors.quick_create_overall_failed_toast'),
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };


  const addSection = () => {
    // Generate next section letter (A, B, C...)
    const lastSectionCode = quickCreateForm.sections[quickCreateForm.sections.length - 1].charCodeAt(0);
    const nextSection = String.fromCharCode(lastSectionCode + 1);

    if (quickCreateForm.sections.length < 10 && nextSection <= 'Z') { // Limit to Z or 10 sections
      setQuickCreateForm(prev => ({
        ...prev,
        sections: [...prev.sections, nextSection]
      }));
    }
  };

  const removeSection = (index: number) => {
    if (quickCreateForm.sections.length > 1) {
      setQuickCreateForm(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }));
    }
  };

  const handleOpenModal = (cls?: SchoolClass) => {
    if (cls) {
      // Determine education system for existing class
      const detectedSystem = allCameroonLevels.francophone.includes(cls.level) ? 'francophone' : 'anglophone';

      setForm({
        ...cls,
        capacity: cls.capacity ?? "",
        amountFee: cls.amountFee ?? "",
        description: cls.description ?? "",
        // Ensure subjectInfo and teacherInfo are strings (ObjectIds)
        subjects: cls.subjects?.map((item: any) => ({
          subjectInfo: item.subjectInfo?._id || item.subjectInfo,
          coefficient: item.coefficient ?? "", // Handle null/undefined coefficient
          teacherInfo: item.teacherInfo?._id || item.teacherInfo, // Handle null/undefined teacherInfo
        })) || [],
        mainTeacherInfo: cls.mainTeacherInfo || undefined, // Ensure empty string becomes undefined
        year: cls.year || generateAcademicYear(), // Ensure year is present
      });
      setEducationSystem(detectedSystem);
      setEditingId(cls._id || null);
    } else {
      resetForm();
      setEditingId(null);
    }
    setError(null);
    setShowModal(true);
  };

  const handleEdit = (cls: SchoolClass) => {
    handleOpenModal(cls);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('classes.confirm_delete'))) return;
    setLoading(true);
    setError(null);
    try {
      await classService.remove(id);
      toast({
        title: t('classes.success.delete_title'),
        description: t('classes.success.delete_description'),
        variant: "default"
      });
      fetchClasses();
    } catch (error: any) {
      console.error("Failed to delete class:", error);
      const errorMessage = error.response?.data?.message || t('classes.errors.delete_failed_generic');
      setError(errorMessage);
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (cls: SchoolClass) => {
    setLoading(true);
    try {
      // Ensure the status is 'Open' or 'Closed' explicitly for the API
      const newStatus = cls.status === "Open" || cls.status === "Ouvert" ? "Closed" : "Open";
      await classService.update(cls._id!, { status: newStatus });
      toast({
        title: t('classes.success.toggle_status_title'),
        description: t('classes.success.toggle_status_description', { name: cls.classesName, status: newStatus }),
        variant: "default"
      });
      fetchClasses();
    } catch (error: any) {
      console.error("Failed to toggle class status:", error);
      const errorMessage = error.response?.data?.message || t('classes.errors.toggle_status_failed_generic');
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const bstr = e.target?.result;
        if (!bstr) throw new Error(t('classes.errors.file_read_failed'));
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        // Convert data to SchoolClass[] and ensure numeric fields are numbers
        const classesToImport: SchoolClass[] = data.map((item: any) => ({
          classesName: item.classesName,
          description: item.description,
          status: item.status || 'Open',
          capacity: Number(item.capacity),
          amountFee: Number(item.amountFee),
          level: item.level,
          year: item.year,
          mainTeacherInfo: item.mainTeacherInfo || undefined,
          subjects: item.subjects ? JSON.parse(item.subjects).map((subj: any) => ({
            subjectInfo: subj.subjectInfo,
            coefficient: Number(subj.coefficient),
            teacherInfo: subj.teacherInfo || undefined
          })) : [],
          studentList: [], // Assume students are added separately
        }));

        const res = await classService.bulkImport(classesToImport);
        let importMessage = t('classes.success.import_success_description', { count: res.savedClasses.length });
        if (res.errors && res.errors.length > 0) {
          importMessage += ` ${t('classes.errors.import_with_errors', { count: res.errors.length })}`;
          setError(t('classes.errors.import_errors_list', { errors: res.errors.map((err: any) => err.error).join(', ') }));
          toast({
            title: t('classes.success.import_partial_title'),
            description: importMessage,
            variant: "warning"
          });
        } else {
          toast({
            title: t('classes.success.import_title'),
            description: importMessage,
            variant: "default"
          });
        }
        fetchClasses();
      } catch (error: any) {
        console.error("Failed to import classes:", error);
        const errorMessage = error.message || t('classes.errors.import_failed_generic');
        setError(errorMessage);
        toast({
          title: t('common.error'),
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };


  const exportExcel = () => {
    const dataToExport = classes.map(cls => ({
      ...cls,
      subjects: JSON.stringify(cls.subjects?.map((s: any) => ({
        subjectInfo: s.subjectInfo?._id || s.subjectInfo, // ensure just ID is exported
        coefficient: s.coefficient,
        teacherInfo: s.teacherInfo?._id || s.teacherInfo
      })) || []),
      studentList: JSON.stringify(cls.studentList?.map((s: any) => s._id || s) || []) // ensure just IDs are exported
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classes");
    XLSX.writeFile(wb, "classes.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    doc.setFontSize(16);
    doc.text(t('classes.export.title'), 14, 20);
    doc.setFontSize(10);
    doc.text(`${t('classes.export.date')}: ${date}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [[
        t('classes.table.name'),
        t('classes.table.level'), // Added level to PDF export
        t('classes.table.status'),
        t('classes.table.capacity'),
        t('classes.table.year')
      ]],
      body: classes.map((cls) => [
        cls.classesName,
        cls.level, // Added level to PDF export
        cls.status,
        cls.capacity ?? "",
        cls.year ?? "",
      ]),
      styles: { halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save(`classes_${date.replace(/\//g, "-")}.pdf`);
  };

  const handleSubjectChange = (index: number, field: keyof ClassSubject, value: any) => {
    const updatedSubjects = [...form.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value,
    };
    setForm({ ...form, subjects: updatedSubjects });
  };

  const addSubject = () => {
    setForm({
      ...form,
      subjects: [...form.subjects, { subjectInfo: "", coefficient: "", teacherInfo: "" }],
    });
  };

  const removeSubject = (index: number) => {
    setForm({
      ...form,
      subjects: form.subjects.filter((_, i) => i !== index),
    });
  };

  const availableSubjectsForIndex = (index: number) => {
    const selectedIds = form.subjects.map((s) => s.subjectInfo).filter(Boolean);
    return subjects.filter(
      (subj) => !selectedIds.includes(subj._id) || subj._id === form.subjects[index]?.subjectInfo
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('classes.title')}</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <Input
          placeholder={t('classes.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64"
          disabled={loading}
        />
        <div className="flex flex-wrap items-center gap-2">
            {/* New Year Filter */}
            {uniqueAcademicYears.length > 0 && (
              <Select value={filterYear} onValueChange={setFilterYear} disabled={loading}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('classes.filter_year_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('classes.filter_year_all')}</SelectItem>
                  {uniqueAcademicYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

          <Button
            onClick={() => handleOpenModal()}
            disabled={loading || submitting}
          >
            <FilePlus className="mr-2 h-4 w-4" /> {t('classes.add_button')}
          </Button>
          <Button
            onClick={() => setShowQuickCreateModal(true)}
            disabled={loading || submitting}
            variant="secondary"
          >
            <GraduationCap className="mr-2 h-4 w-4" /> {t('classes.quick_create')}
          </Button>
          <Button variant="outline" onClick={exportExcel} disabled={loading || submitting}>
            <Download className="mr-2 h-4 w-4" /> {t('classes.export_excel')}
          </Button>
          <Button variant="outline" onClick={exportPDF} disabled={loading || submitting}>
            <Download className="mr-2 h-4 w-4" /> {t('classes.export_pdf')}
          </Button>
          <label className="cursor-pointer bg-muted px-3 py-1 rounded">
            <Upload className="inline h-4 w-4 mr-2" /> {t('classes.import_button')}
            <input
              type="file"
              hidden
              onChange={(e) => e.target.files && handleImport(e.target.files[0])}
              disabled={loading || submitting}
              accept=".xls,.xlsx"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">{t('classes.loading')}</p>
          </div>
        </div>
      ) : filteredClasses.length === 0 ? ( // Use filteredClasses for empty state check
        <div className="text-center py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">
                {search || filterYear !== 'all' ? t('classes.no_results') : t('classes.no_classes')}
              </p>
              {!search && filterYear === 'all' && (
                <Button onClick={() => handleOpenModal()} className="mt-4">
                  <FilePlus className="h-4 w-4 mr-2" />
                  {t('classes.add_first')}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ClassesGroupedView
          currentData={currentData}
          expandedLevels={expandedLevels}
          setExpandedLevels={setExpandedLevels}
          loading={loading}
          submitting={submitting}
          handleEdit={handleEdit}
          toggleStatus={toggleStatus}
          handleDelete={handleDelete}
          t={t} // Pass translation function
        />
      )}

      {!loading && filteredClasses.length > 0 && ( // Use filteredClasses for pagination visibility
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-muted rounded disabled:opacity-50"
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || loading}
          >
            {t('pagination.previous')}
          </button>

          <div className="space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`px-3 py-1 rounded ${currentPage === index + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                  }`}
                onClick={() => goToPage(index + 1)}
                disabled={loading}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            className="px-4 py-2 bg-muted rounded disabled:opacity-50"
            onClick={goToNextPage}
            disabled={currentPage === totalPages || loading}
          >
            {t('pagination.next')}
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? t('classes.edit_title') : t('classes.create_title')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('classes.form.name')}</Label>
                <Input
                  value={form.classesName}
                  onChange={(e) => setForm({ ...form, classesName: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label>{t('classes.form.description')}</Label>
                <Input
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div>
                <Label>{t('classes.form.status')}</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('classes.form.select_status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">{t('classes.status.open')}</SelectItem>
                    <SelectItem value="Closed">{t('classes.status.closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('classes.form.capacity')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.capacity ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label>{t('classes.form.fee')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.amountFee ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, amountFee: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('classes.form.education_system')}</Label>
                  <Select
                    value={educationSystem}
                    onValueChange={(value: 'francophone' | 'anglophone') => {
                      setEducationSystem(value);
                      setForm({ ...form, level: "" });
                    }}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('classes.form.select_system')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="francophone">🇫🇷 {t('classes.system.francophone')}</SelectItem>
                      <SelectItem value="anglophone">🇬🇧 {t('classes.system.anglophone')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('classes.form.level')}</Label>
                  <Select
                    value={form.level}
                    onValueChange={(value) => setForm({ ...form, level: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('classes.form.select_level')} />
                    </SelectTrigger>
                    <SelectContent>
                      {educationSystem === 'francophone' && allCameroonLevels.francophone.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                      {educationSystem === 'anglophone' && allCameroonLevels.anglophone.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('classes.form.academic_year')}</Label>
                  <Input
                    type="text"
                    value={form.year ?? ""}
                    pattern="\d{4}-\d{4}"
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder={t('classes.form.year_placeholder')}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label>{t('classes.form.main_teacher')}</Label>
                <Select
                  value={form.mainTeacherInfo ?? ""}
                  onValueChange={(value) => setForm({ ...form, mainTeacherInfo: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('classes.form.select_teacher')} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {teacher.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-lg font-semibold">{t('classes.form.subjects')}</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addSubject}
                    disabled={submitting || form.subjects.length >= subjects.length}
                  >
                    + {t('classes.form.add_subject')}
                  </Button>
                </div>
                {form.subjects.length === 0 && <p className="text-sm text-muted-foreground">{t('classes.form.no_subjects')}</p>}
                {form.subjects.map((subject, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-center">
                    <div className="col-span-1">
                      <Select
                        value={subject.subjectInfo}
                        onValueChange={(value) => handleSubjectChange(index, "subjectInfo", value)}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('classes.form.subject')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjectsForIndex(index).map((subj) => (
                            <SelectItem key={subj._id} value={subj._id}>
                              {subj.subjectName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        placeholder={t('classes.form.coefficient_placeholder')}
                        min={0}
                        value={subject.coefficient}
                        onChange={(e) =>
                          handleSubjectChange(
                            index,
                            "coefficient",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-span-1">
                      <Select
                        value={subject.teacherInfo ?? ""}
                        onValueChange={(value) => handleSubjectChange(index, "teacherInfo", value)}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('classes.form.teacher')} />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="self-center"
                        onClick={() => removeSubject(index)}
                        disabled={submitting}
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingId ? t('common.updating') : t('common.creating')}
                    </>
                  ) : (
                    editingId ? t('common.update') : t('common.create')
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuickCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              🚀 {t('classes.quick_create_title')}
            </h2>
            <div className="space-y-4">
              <div>
                <Label>{t('classes.form.level')}</Label>
                <Select
                  value={quickCreateForm.level}
                  onValueChange={(value) => setQuickCreateForm(prev => ({ ...prev, level: value }))}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('classes.form.select_level')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t('classes.system.francophone')}</SelectLabel>
                      {allCameroonLevels.francophone.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>{t('classes.system.anglophone')}</SelectLabel>
                      {allCameroonLevels.anglophone.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('classes.form.sections')}</Label>
                <div className="space-y-2">
                  {quickCreateForm.sections.map((section, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={`${quickCreateForm.level ? quickCreateForm.level + ' ' : ''}${section}`}
                        readOnly
                        className="flex-1"
                      />
                      {quickCreateForm.sections.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSection(index)}
                          disabled={submitting}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSection}
                    disabled={submitting || quickCreateForm.sections.length >= 10}
                  >
                    + {t('classes.form.add_section')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('classes.form.academic_year')}</Label>
                  <Input
                    value={quickCreateForm.year}
                    onChange={(e) => setQuickCreateForm(prev => ({ ...prev, year: e.target.value }))}
                    pattern="\d{4}-\d{4}"
                    placeholder="2024-2025"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label>{t('classes.form.capacity')}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={quickCreateForm.capacity}
                    onChange={(e) => setQuickCreateForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 30 }))}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label>{t('classes.form.fee')}</Label>
                <Input
                  type="number"
                  min={0}
                  value={quickCreateForm.amountFee}
                  onChange={(e) => setQuickCreateForm(prev => ({ ...prev, amountFee: parseInt(e.target.value) || 0 }))}
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="addDefaultSubjects"
                  checked={quickCreateForm.addDefaultSubjects}
                  onChange={(e) => setQuickCreateForm(prev => ({ ...prev, addDefaultSubjects: e.target.checked }))}
                  disabled={submitting}
                />
                <Label htmlFor="addDefaultSubjects">
                  {t('classes.form.add_default_subjects')}
                </Label>
              </div>

              {quickCreateForm.addDefaultSubjects && quickCreateForm.level && (
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm font-medium mb-2">{t('classes.form.subjects_to_add')}:</p>
                  <div className="text-xs space-y-1">
                    {(educationSystemForLevel
                      ? defaultSubjects[educationSystemForLevel]
                      : []
                    ).map((subject, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{subject.name}</span>
                        <span className="text-muted-foreground">{t('classes.form.coefficient_short')} {subject.coefficient}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowQuickCreateModal(false)}
                disabled={submitting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleQuickCreate}
                disabled={submitting || !quickCreateForm.level}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.creating')}
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {t('classes.create_count', { count: quickCreateForm.sections.length })}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesManagement;