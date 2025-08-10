import React, { useEffect, useState, useCallback } from "react";
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
} from "@/components/ui/select";
import { subjectService } from "@/lib/services/subjectService";
import { userService } from "@/lib/services/userService";
import ClassesGroupedView from "@/components/ClassesGroupedView";

interface SubjectItem {
  _id: string;
  subjectName: string;
}
interface TeacherItem {
  _id: string;
  fullName: string;
}
interface ClassSubject {
  subjectInfo: string; // subject _id
  coefficient: number | "";
  teacherInfo: string; // teacher _id
}

const itemsPerPage = 5;

const ClassesManagement = () => {
  const { toast } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [search, setSearch] = useState("");

  // Subjects and teachers list from API
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);

  // Predefined subjects for quick creation
  const defaultSubjects = {
    francophone: [
      { name: 'Français', coefficient: 4 },
      { name: 'Mathématiques', coefficient: 4 },
      { name: 'Anglais', coefficient: 3 },
      { name: 'Histoire-Géographie', coefficient: 3 },
      { name: 'Sciences Physiques', coefficient: 3 },
      { name: 'Sciences de la Vie et de la Terre', coefficient: 3 },
      { name: 'Éducation Physique et Sportive', coefficient: 2 },
      { name: 'Arts Plastiques', coefficient: 2 },
      { name: 'Musique', coefficient: 2 }
    ],
    anglophone: [
      { name: 'English Language', coefficient: 4 },
      { name: 'Mathematics', coefficient: 4 },
      { name: 'French', coefficient: 3 },
      { name: 'History', coefficient: 3 },
      { name: 'Geography', coefficient: 3 },
      { name: 'Physics', coefficient: 3 },
      { name: 'Chemistry', coefficient: 3 },
      { name: 'Biology', coefficient: 3 },
      { name: 'Physical Education', coefficient: 2 },
      { name: 'Arts', coefficient: 2 }
    ]
  };

  // Form state and editing
  const [form, setForm] = useState<Omit<SchoolClass, "_id"> & { subjects: ClassSubject[] }>({
    classesName: "",
    description: "",
    status: "Ouvert",
    capacity: "30", // Capacité par défaut
    amountFee: "",
    level: "",
    subjects: [],
    studentList: [],
    mainTeacherInfo: "",
    year: "",
  });
  const [educationSystem, setEducationSystem] = useState<'francophone' | 'anglophone'>('francophone');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick create state
  const [quickCreateForm, setQuickCreateForm] = useState({
    level: '',
    sections: ['A', 'B', 'C', 'D'],
    year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    capacity: 30,
    amountFee: 0,
    addDefaultSubjects: true
  });

   // Générer un nom de classe automatique
   const generateClassName = () => {
     const levels = educationSystem === 'francophone' 
       ? ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI']
       : ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth A', 'Lower Sixth C', 'Lower Sixth D', 'Lower Sixth TI', 'Upper Sixth A', 'Upper Sixth C', 'Upper Sixth D', 'Upper Sixth TI'];
     const randomLevel = levels[Math.floor(Math.random() * levels.length)];
     const section = String.fromCharCode(65 + Math.floor(Math.random() * 3)); // A, B, or C
     return `${randomLevel} ${section}`;
   };

   // Générer une année académique par défaut
   const generateAcademicYear = () => {
     const currentYear = new Date().getFullYear();
     return `${currentYear}-${currentYear + 1}`;
   };

  // Pagination
  const filtered = classes.filter((cls) =>
    `${cls.classesName} ${cls.description ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const {
    currentPage,
    totalPages,
    currentData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = usePagination(filtered, itemsPerPage);

  // Fetch classes once on mount
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await classService.getAll({});
      setClasses(res.data.classes || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setError("Erreur lors du chargement des classes. Veuillez réessayer.");
      setClasses([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await subjectService.getAll({});
      setSubjects(res.data.subjects || []);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matières",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    try {
      const res = await userService.getAll({ roles: "TEACHER" });
      setTeachers(res.data.users || []);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setTeachers([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les enseignants",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, [fetchClasses, fetchSubjects, fetchTeachers]);

  // Submit handler (create or update)
  // Reset form function
  const resetForm = () => {
    setForm({
      classesName: generateClassName(),
      description: "",
      status: "Open",
      capacity: "30",
      amountFee: "",
      level: "",
      subjects: [],
      studentList: [],
      mainTeacherInfo: "",
      year: generateAcademicYear(),
    });
    setEducationSystem('francophone');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Simple validation example
    if (!form.classesName.trim()) {
      setError("Le nom de la classe est requis");
      setSubmitting(false);
      return;
    }
    if (form.subjects.some((s) => !s.subjectInfo || !s.teacherInfo)) {
      setError("Chaque matière doit avoir un sujet et un enseignant assignés");
      setSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await classService.update(editingId, form);
        toast({ 
          title: "Classe mise à jour avec succès",
          variant: "default"
        });
      } else {
        await classService.create(form);
        toast({ 
          title: "Classe créée avec succès",
          variant: "default"
        });
      }
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchClasses();
    } catch (error) {
      console.error("Failed to save class:", error);
      setError(editingId ? "Erreur lors de la mise à jour de la classe" : "Erreur lors de la création de la classe");
      toast({ 
        title: "Erreur lors de l'enregistrement",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick create multiple classes with sections
  const handleQuickCreate = async () => {
    if (!quickCreateForm.level) {
      toast({ title: "Veuillez sélectionner un niveau", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const educationSystem = ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'].includes(quickCreateForm.level) ? 'francophone' : 'anglophone';
      
      // Create subjects if needed
      let subjectsToAdd: ClassSubject[] = [];
      if (quickCreateForm.addDefaultSubjects) {
        const defaultSubjectsForSystem = defaultSubjects[educationSystem];
        
        for (const defaultSubject of defaultSubjectsForSystem) {
          // Check if subject exists, if not create it
          let existingSubject = subjects.find(s => s.subjectName === defaultSubject.name);
          
          if (!existingSubject) {
            try {
              const newSubject = await subjectService.create({
                subjectName: defaultSubject.name,
                subjectCode: defaultSubject.name.substring(0, 3).toUpperCase(),
                description: `Matière ${defaultSubject.name}`,
                isActive: true
              });
              existingSubject = newSubject;
              // Update subjects list
              setSubjects(prev => [...prev, newSubject]);
            } catch (error) {
              console.warn(`Failed to create subject ${defaultSubject.name}:`, error);
              continue;
            }
          }
          
          subjectsToAdd.push({
            subjectInfo: existingSubject._id,
            coefficient: defaultSubject.coefficient
            // teacherInfo will be assigned later
          });
        }
      }

      // Create classes for each section
      const createdClasses = [];
      for (const section of quickCreateForm.sections) {
        const className = `${quickCreateForm.level}${section}`;
        
        const classData = {
          classesName: className,
          description: `Classe de ${quickCreateForm.level} section ${section}`,
          status: "Open",
          capacity: quickCreateForm.capacity,
          level: quickCreateForm.level,
          amountFee: quickCreateForm.amountFee,
          year: quickCreateForm.year,
          subjects: subjectsToAdd,
          studentList: []
          // mainTeacherInfo will be assigned later
        };

        try {
          const createdClass = await classService.create(classData);
          createdClasses.push(createdClass);
        } catch (error) {
          console.error(`Failed to create class ${className}:`, error);
          toast({ 
            title: `Erreur lors de la création de la classe ${className}`,
            variant: "destructive"
          });
        }
      }

      if (createdClasses.length > 0) {
        toast({ 
          title: `${createdClasses.length} classe(s) créée(s) avec succès`,
          variant: "default"
        });
        fetchClasses();
        setShowQuickCreateModal(false);
        // Reset form
        setQuickCreateForm({
          level: '',
          sections: ['A', 'B', 'C', 'D'],
          year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          capacity: 30,
          amountFee: 0,
          addDefaultSubjects: true
        });
      }
    } catch (error) {
      console.error("Quick create error:", error);
      toast({ 
        title: "Erreur lors de la création rapide",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Add/remove sections for quick create
  const addSection = () => {
    const nextSection = String.fromCharCode(65 + quickCreateForm.sections.length); // A, B, C, etc.
    if (quickCreateForm.sections.length < 10) { // Limit to 10 sections
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

  // Open modal for adding new class
  const handleOpenModal = (cls?: SchoolClass) => {
    if (cls) {
      // Edit mode - detect education system based on level
      const francophonesLevels = ['6e', '5e', '4e', '3e', '2nde', '1ère A', '1ère C', '1ère D', '1ère TI', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale TI'];
      const detectedSystem = francophonesLevels.includes(cls.level) ? 'francophone' : 'anglophone';
      
      setForm({
        ...cls,
        capacity: cls.capacity ?? "",
        amountFee: cls.amountFee ?? "",
        description: cls.description ?? "",
        subjects: cls.subjects?.map((item: any) => ({
          subjectInfo: item.subjectInfo?._id || item.subjectInfo,
          coefficient: item.coefficient || "",
          teacherInfo: item.teacherInfo?._id || item.teacherInfo?.id || "", // normalize id with safety check
        })) || [],
      });
      setEducationSystem(detectedSystem);
      setEditingId(cls._id || null);
    } else {
      // Add mode - use resetForm
      resetForm();
      setEditingId(null);
    }
    setError(null);
    setShowModal(true);
  };

  // Edit class, load data into form
  const handleEdit = (cls: SchoolClass) => {
    handleOpenModal(cls);
  };

  // Delete class with confirmation
  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return;
    setLoading(true);
    setError(null);
    try {
      await classService.remove(id);
      toast({ 
        title: "Classe supprimée avec succès",
        variant: "default"
      });
      fetchClasses();
    } catch (error) {
      console.error("Failed to delete class:", error);
      setError("Erreur lors de la suppression de la classe. Veuillez réessayer.");
      toast({ 
        title: "Erreur lors de la suppression",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle class status Open/Closed
  const toggleStatus = async (cls: SchoolClass) => {
    setLoading(true);
    try {
      await classService.update(cls._id!, {
        ...cls,
        status: cls.status === "Ouvert" ? "Fermé" : "Ouvert",
      });
      fetchClasses();
    } catch {
      toast({ title: "Erreur lors du changement de statut" });
    } finally {
      setLoading(false);
    }
  };

  // Handle file import
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        classService.bulkImport(data as SchoolClass[]).then(() => {
          toast({ title: "Import réussi" });
          fetchClasses();
        });
      } catch {
        toast({ title: "Erreur lors de l'import" });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export to Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(classes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Classes");
    XLSX.writeFile(wb, "classes.xlsx");
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("fr-FR");
    doc.setFontSize(16);
    doc.text("Liste des Classes", 14, 20);
    doc.setFontSize(10);
    doc.text(`Date d'exportation : ${date}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Nom", "Statut", "Capacité", "Année"]],
      body: classes.map((cls) => [
        cls.classesName,
        cls.status,
        cls.capacity ?? "",
        cls.year ?? "",
      ]),
      styles: { halign: "center" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save(`classes_${date.replace(/\//g, "-")}.pdf`);
  };

  // Manage subjects in form
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

  // Prevent selecting duplicate subjects
  const availableSubjectsForIndex = (index: number) => {
    const selectedIds = form.subjects.map((s) => s.subjectInfo).filter(Boolean);
    return subjects.filter(
      (subj) => !selectedIds.includes(subj._id) || subj._id === form.subjects[index]?.subjectInfo
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Classes</h1>
      </div>
      
      {/* Error Display */}
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
      
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Rechercher une classe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
          disabled={loading}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => handleOpenModal()}
            disabled={loading || submitting}
          >
            <FilePlus className="mr-2 h-4 w-4" /> Ajouter
          </Button>
          <Button 
            onClick={() => setShowQuickCreateModal(true)} 
            disabled={loading || submitting}
            variant="secondary"
          >
            <GraduationCap className="mr-2 h-4 w-4" /> Création Rapide
          </Button>
          <Button variant="outline" onClick={exportExcel} disabled={loading || submitting}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" onClick={exportPDF} disabled={loading || submitting}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <label className="cursor-pointer bg-muted px-3 py-1 rounded">
            <Upload className="inline h-4 w-4 mr-2" /> Importer
            <input
              type="file"
              hidden
              onChange={(e) => e.target.files && handleImport(e.target.files[0])}
              disabled={loading || submitting}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Chargement des classes...</p>
          </div>
        </div>
      ) : currentData.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">
                {search ? "Aucune classe trouvée" : "Aucune classe disponible"}
              </p>
              {!search && (
                <Button onClick={() => handleOpenModal()} className="mt-4">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Ajouter une classe
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
          />
      )}

      {/* Pagination */}
      {!loading && currentData.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-muted rounded disabled:opacity-50"
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || loading}
          >
            Précédent
          </button>

          <div className="space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
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
            Suivant
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Modifier" : "Créer"} une Classe
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={form.classesName}
                  onChange={(e) => setForm({ ...form, classesName: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div>
                <Label>Statut</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm({ ...form, status: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Ouvert</SelectItem>
                    <SelectItem value="Closed">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Capacité</Label>
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
                  <Label>Frais (Amount Fee)</Label>
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
                  <Label>Système Éducatif</Label>
                  <Select
                    value={educationSystem}
                    onValueChange={(value: 'francophone' | 'anglophone') => {
                      setEducationSystem(value);
                      setForm({ ...form, level: "" }); // Reset level when changing system
                    }}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un système" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="francophone">🇫🇷 Système Francophone</SelectItem>
                      <SelectItem value="anglophone">🇬🇧 Système Anglophone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Niveau</Label>
                  <Select
                    value={form.level}
                    onValueChange={(value) => setForm({ ...form, level: value })}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationSystem === 'francophone' ? (
                        <>
                          <SelectItem value="6e">6e (Sixième)</SelectItem>
                          <SelectItem value="5e">5e (Cinquième)</SelectItem>
                          <SelectItem value="4e">4e (Quatrième)</SelectItem>
                          <SelectItem value="3e">3e (Troisième)</SelectItem>
                          <SelectItem value="2nde">2nde (Seconde)</SelectItem>
                          <SelectItem value="1ère A">1ère A (Première Littéraire)</SelectItem>
                          <SelectItem value="1ère C">1ère C (Première Scientifique)</SelectItem>
                          <SelectItem value="1ère D">1ère D (Première Sciences Expérimentales)</SelectItem>
                          <SelectItem value="1ère TI">1ère TI (Première Technique Industrielle)</SelectItem>
                          <SelectItem value="Terminale A">Terminale A (Littéraire)</SelectItem>
                          <SelectItem value="Terminale C">Terminale C (Scientifique)</SelectItem>
                          <SelectItem value="Terminale D">Terminale D (Sciences Expérimentales)</SelectItem>
                          <SelectItem value="Terminale TI">Terminale TI (Technique Industrielle)</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Form 1">Form 1</SelectItem>
                          <SelectItem value="Form 2">Form 2</SelectItem>
                          <SelectItem value="Form 3">Form 3</SelectItem>
                          <SelectItem value="Form 4">Form 4</SelectItem>
                          <SelectItem value="Form 5">Form 5</SelectItem>
                          <SelectItem value="Lower Sixth A">Lower Sixth A (Arts)</SelectItem>
                          <SelectItem value="Lower Sixth C">Lower Sixth C (Science)</SelectItem>
                          <SelectItem value="Lower Sixth D">Lower Sixth D (Biology)</SelectItem>
                          <SelectItem value="Lower Sixth TI">Lower Sixth TI (Technical)</SelectItem>
                          <SelectItem value="Upper Sixth A">Upper Sixth A (Arts)</SelectItem>
                          <SelectItem value="Upper Sixth C">Upper Sixth C (Science)</SelectItem>
                          <SelectItem value="Upper Sixth D">Upper Sixth D (Biology)</SelectItem>
                          <SelectItem value="Upper Sixth TI">Upper Sixth TI (Technical)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Année Académique (YYYY-YYYY)</Label>
                  <Input
                    type="text"
                    value={form.year ?? ""}
                    pattern="\d{4}-\d{4}"
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="ex: 2024-2025"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label>Enseignant Principal</Label>
                <Select
                  value={form.mainTeacherInfo ?? ""}
                  onValueChange={(value) => setForm({ ...form, mainTeacherInfo: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'enseignant" />
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

              {/* Subjects Section */}
              <div className="border p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-lg font-semibold">Matières</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addSubject}
                    disabled={submitting || form.subjects.length >= subjects.length}
                  >
                    + Ajouter une matière
                  </Button>
                </div>
                {form.subjects.length === 0 && <p>Aucune matière ajoutée</p>}
                {form.subjects.map((subject, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2 items-center">
                    <Select
                      value={subject.subjectInfo}
                      onValueChange={(value) => handleSubjectChange(index, "subjectInfo", value)}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubjectsForIndex(index).map((subj) => (
                          <SelectItem key={subj._id} value={subj._id}>
                            {subj.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder="Coefficient"
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

                    <Select
                      value={subject.teacherInfo}
                      onValueChange={(value) => handleSubjectChange(index, "teacherInfo", value)}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Enseignant" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      className="self-center"
                      onClick={() => removeSubject(index)}
                      disabled={submitting}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>

              {/* Error Display in Modal */}
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
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingId ? "Mise à jour..." : "Création..."}
                    </>
                  ) : (
                    editingId ? "Mettre à jour" : "Créer"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      {showQuickCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              🚀 Création Rapide de Classes
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Niveau</Label>
                <Select
                  value={quickCreateForm.level}
                  onValueChange={(value) => setQuickCreateForm(prev => ({ ...prev, level: value }))}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6e">6e (Sixième)</SelectItem>
                    <SelectItem value="5e">5e (Cinquième)</SelectItem>
                    <SelectItem value="4e">4e (Quatrième)</SelectItem>
                    <SelectItem value="3e">3e (Troisième)</SelectItem>
                    <SelectItem value="2nde">2nde (Seconde)</SelectItem>
                    <SelectItem value="1ère A">1ère A (Première Littéraire)</SelectItem>
                    <SelectItem value="1ère C">1ère C (Première Scientifique)</SelectItem>
                    <SelectItem value="1ère D">1ère D (Première Sciences Expérimentales)</SelectItem>
                    <SelectItem value="1ère TI">1ère TI (Première Technique Industrielle)</SelectItem>
                    <SelectItem value="Terminale A">Terminale A (Littéraire)</SelectItem>
                    <SelectItem value="Terminale C">Terminale C (Scientifique)</SelectItem>
                    <SelectItem value="Terminale D">Terminale D (Sciences Expérimentales)</SelectItem>
                    <SelectItem value="Terminale TI">Terminale TI (Technique Industrielle)</SelectItem>
                    <SelectItem value="Form 1">Form 1</SelectItem>
                    <SelectItem value="Form 2">Form 2</SelectItem>
                    <SelectItem value="Form 3">Form 3</SelectItem>
                    <SelectItem value="Form 4">Form 4</SelectItem>
                    <SelectItem value="Form 5">Form 5</SelectItem>
                    <SelectItem value="Lower Sixth A">Lower Sixth A (Arts)</SelectItem>
                    <SelectItem value="Lower Sixth C">Lower Sixth C (Science)</SelectItem>
                    <SelectItem value="Lower Sixth D">Lower Sixth D (Biology)</SelectItem>
                    <SelectItem value="Lower Sixth TI">Lower Sixth TI (Technical)</SelectItem>
                    <SelectItem value="Upper Sixth A">Upper Sixth A (Arts)</SelectItem>
                    <SelectItem value="Upper Sixth C">Upper Sixth C (Science)</SelectItem>
                    <SelectItem value="Upper Sixth D">Upper Sixth D (Biology)</SelectItem>
                    <SelectItem value="Upper Sixth TI">Upper Sixth TI (Technical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sections</Label>
                <div className="space-y-2">
                  {quickCreateForm.sections.map((section, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input 
                        value={`${quickCreateForm.level}${section}`} 
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
                    + Ajouter une section
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Année Académique</Label>
                  <Input
                    value={quickCreateForm.year}
                    onChange={(e) => setQuickCreateForm(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2024-2025"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label>Capacité</Label>
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
                <Label>Frais de Scolarité</Label>
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
                  Ajouter les matières par défaut
                </Label>
              </div>

              {quickCreateForm.addDefaultSubjects && quickCreateForm.level && (
                <div className="bg-muted p-3 rounded">
                  <p className="text-sm font-medium mb-2">Matières qui seront ajoutées :</p>
                  <div className="text-xs space-y-1">
                    {((['6e', '5e', '4e', '3e', '2nde', '1ère', 'Terminale'].includes(quickCreateForm.level) 
                      ? defaultSubjects.francophone 
                      : defaultSubjects.anglophone
                    )).map((subject, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{subject.name}</span>
                        <span className="text-muted-foreground">Coef. {subject.coefficient}</span>
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
                Annuler
              </Button>
              <Button 
                onClick={handleQuickCreate}
                disabled={submitting || !quickCreateForm.level}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Créer {quickCreateForm.sections.length} classe(s)
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
