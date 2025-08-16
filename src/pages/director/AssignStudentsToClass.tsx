import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { academicService } from "@/lib/services/academicService";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { AlertCircle, CheckCircle, GraduationCap, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

export default function AssignStudentsToClass({
  students,
  selectedClass,
  selectedYear,
  selectedStudents,
  setSelectedStudents,
  fetchStudents
}) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleStudentSelection = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedYear || selectedStudents.length === 0) {
      toast({
        title: t('school.assign_class.error.required'),
        description: t('school.assign_class.error.selectRequirements'),
      });
      return;
    }

    try {
      const response = await academicService.assignStudent(
        selectedStudents,
        selectedClass,
        selectedYear
      );
      toast({
        title: t('school.assign_class.success.title'),
        description: t('school.assign_class.success.description', {
          created: response.summary.created,
          updated: response.summary.updated,
          failed: response.summary.failedCount
        }),
      });

      setSelectedStudents([]); // reset selection
      fetchStudents()
    } catch (err) {
      console.log(err)
      toast({
        title: t('school.assign_class.error.title'),
        description: err.response?.data?.message || t('school.assign_class.error.general'),
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle className="w-4 h-4 text-primary" />
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
                <AlertCircle className="w-4 h-4 text-destructive" />
              </TooltipTrigger>
              <TooltipContent>{t('school.assign_class.status.suspended')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <XCircle className="w-4 h-4 text-destructive" />
              </TooltipTrigger>
              <TooltipContent>{t('school.assign_class.status.inactive')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
    }
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

        <div className="border rounded-lg p-4 max-h-80 overflow-y-auto space-y-2">
          {students.length > 0 ? (
            students.map((student) => {
              const isSelected = selectedStudents.includes(student._id);

              return (
                <label
                  key={student._id}
                  className="flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 px-3 py-2 rounded border border-transparent hover:border-muted transition"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleStudentSelection(student._id)}
                    />
                    <div className="text-sm leading-tight">
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {student.matricule} – {student.level} - {student?.classInfo?.classesName || t('school.assign_class.notAssigned')} 
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
              {t('school.assign_class.noStudents')}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-4 items-center"></div>

          {selectedClass && selectedYear && selectedStudents.length > 0 && (
            <Button onClick={handleSubmit} className="ml-auto">
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('school.assign_class.assignButton')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}