import React, { useEffect, useState, useCallback, useMemo } from "react";
// Removed AppLayout as this is a sub-component
import { academicService } from "@/lib/services/academicService";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
// Removed direct axios import, rely on academicService's axios instance
import { AlertCircle, CheckCircle, GraduationCap, Loader2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Input for local search in this component
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { Student } from "@/lib/services/studentService"; // Import Student interface

// Define prop types explicitly
interface AssignStudentsToClassProps {
  students: Student[]; // Filtered list of raw students available for assignment
  selectedClass: string; // The ID of the class chosen in the parent's filter
  selectedYear: string; // The academic year chosen in the parent's filter
  fetchStudents: () => void; // Callback to refresh academic student data in parent after assignment
}

export default function AssignStudentsToClass({
  students, // These are the filtered RAW students from the parent
  selectedClass,
  selectedYear,
  fetchStudents, // Renamed from fetchStudents to fetchAcademicStudents for clarity
}: AssignStudentsToClassProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Manage selection internally within this component
  const [localSelectedStudents, setLocalSelectedStudents] = useState<string[]>([]);
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset local selection when class or year changes in parent
  useEffect(() => {
    setLocalSelectedStudents([]);
    setLocalSearchTerm(""); // Optionally reset search too
  }, [selectedClass, selectedYear]);

  // Apply local search to the students prop
  const filteredLocalStudents = useMemo(() => {
    if (!localSearchTerm) {
      return students;
    }
    const lowerCaseSearch = localSearchTerm.toLowerCase();
    return students.filter(
      (student) =>
        student.fullName?.toLowerCase().includes(lowerCaseSearch) ||
        student.firstName?.toLowerCase().includes(lowerCaseSearch) ||
        student.lastName?.toLowerCase().includes(lowerCaseSearch) ||
        student.matricule?.toLowerCase().includes(lowerCaseSearch)
    );
  }, [students, localSearchTerm]);


  const handleStudentSelection = (id: string) => {
    setLocalSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedYear || localSelectedStudents.length === 0) {
      toast({
        title: t('school.assign_class.error.required_title'),
        description: t('school.assign_class.error.selectRequirements'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // academicService.assignStudent expects:
      // studentIds: string[], classId: string, academicYearName: string
      const response = await academicService.assignStudent(
        localSelectedStudents,
        selectedClass,
        selectedYear
      );

      // Assuming the response structure for summary is { created: number, updated: number, failedCount: number }
      toast({
        title: t('school.assign_class.success.title'),
        description: t('school.assign_class.success.description', {
          created: response.summary.created,
          updated: response.summary.updated,
          failed: response.summary.failedCount
        }),
        variant: "default"
      });

      setLocalSelectedStudents([]); // reset local selection
      fetchStudents(); // Call parent's fetchAcademicStudents to refresh the main table data
    } catch (err: any) {
      console.error("Assign student error:", err);
      toast({
        title: t('school.assign_class.error.title'),
        description: err.response?.data?.message || t('school.assign_class.error.general'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string | undefined) => { // Status can be undefined
    switch (status?.toLowerCase()) { // Use optional chaining and toLowerCase for robust check
      case "active":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle className="w-4 h-4 text-green-500" /> {/* Specific color */}
              </TooltipTrigger>
              <TooltipContent>{t('school.assign_class.status.active')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "suspended":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="w-4 h-4 text-orange-500" /> {/* Specific color */}
              </TooltipTrigger>
              <TooltipContent>{t('school.assign_class.status.suspended')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default: // Covers inactive, undefined, or other statuses
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <XCircle className="w-4 h-4 text-red-500" /> {/* Specific color */}
              </TooltipTrigger>
              <TooltipContent>{t('school.assign_class.status.inactive_or_unknown')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
  };

  const handleLocalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };


  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="text-primary" />
        <h2 className="text-2xl font-semibold">
          {t('school.assign_class.title')}
        </h2>
      </div>

      <Card className="p-4 space-y-4 shadow-md">
        <h3 className="text-lg font-medium">
          {t('school.assign_class.studentList')}
        </h3>

        {/* Local search input for the student list */}
        <Input
            placeholder={t('school.assign_class.search_students_placeholder')}
            className="w-full"
            onChange={handleLocalSearch}
            value={localSearchTerm}
            disabled={isSubmitting}
        />

        <div className="border rounded-lg p-4 max-h-80 overflow-y-auto space-y-2">
          {filteredLocalStudents.length > 0 ? (
            filteredLocalStudents.map((student) => {
              const isSelected = localSelectedStudents.includes(student._id!); // Use optional chaining for _id

              return (
                <label
                  key={student._id}
                  className="flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 px-3 py-2 rounded border border-transparent hover:border-muted transition"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleStudentSelection(student._id!)} // Use optional chaining
                      disabled={isSubmitting}
                    />
                    <div className="text-sm leading-tight">
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {student.matricule} – {student.level} - {student?.classesName || t('school.assign_class.notAssigned')}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {getStatusIcon(student.status)}
                  </div>
                </label>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-4">
              {t('school.assign_class.noStudentsFound')}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {t('school.assign_class.selectedCount', { count: localSelectedStudents.length })}
          </div>

          {(selectedClass && selectedYear && localSelectedStudents.length > 0) ? (
            <Button onClick={handleSubmit} className="ml-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                  <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('school.assign_class.assigning')}
                  </>
              ) : (
                  <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('school.assign_class.assignButton')}
                  </>
              )}
            </Button>
          ) : (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button className="ml-auto" disabled>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {t('school.assign_class.assignButton')}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-red-500 text-white">
                        {t('school.assign_class.tooltip_disabled')}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </Card>
    </div>
  );
}