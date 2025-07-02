// src/pages/AssignStudentsToClass.tsx

import { useEffect, useState } from "react";
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

export default function AssignStudentsToClass({
  students,
  selectedClass,
  selectedYear,
  selectedStudents,
  setSelectedStudents,
  fetchStudents
}) {
  const { toast } = useToast();

  const handleStudentSelection = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedYear || selectedStudents.length === 0) {
      toast({
        title: "Champ requis",
        description: "Sélectionnez une classe, une année et au moins un élève.",
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
        title: "Succès",
        description: `Créés: ${response.summary.created}, Mis à jour: ${response.summary.updated}, Échecs: ${response.summary.failedCount}`,
      });

      setSelectedStudents([]); // reset selection
      fetchStudents()
    } catch (err) {
        console.log(err)
      toast({
        title: "Erreur",
        description:
          err.response?.data?.message || "Erreur lors de l’assignation.",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="text-blue-600" />
        <h2 className="text-2xl font-semibold">
          Assigner les élèves à une classe
        </h2>
      </div>

      <Card className="p-4 space-y-4 shadow-md">
        <h3 className="text-lg font-medium">Liste des élèves</h3>

        <div className="border rounded-lg p-4 max-h-80 overflow-y-auto space-y-2">
          {students.map((student) => {
            const isSelected = selectedStudents.includes(student._id);

            const getStatusIcon = () => {
              switch (student.status) {
                case "active":
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </TooltipTrigger>
                        <TooltipContent>Actif</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                case "suspended":
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        </TooltipTrigger>
                        <TooltipContent>Suspens</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                default:
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <XCircle className="w-4 h-4 text-red-600" />
                        </TooltipTrigger>
                        <TooltipContent>Inactif</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
              }
            };

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
                      {student.matricule} – {student.level} - {student?.classInfo?.classesName || "N/A"} 
                    </div>
                  </div>
                </div>

                <div className="shrink-0">{getStatusIcon()}</div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-4 items-center"></div>

          {selectedClass && selectedYear && selectedStudents.length > 0 && (
            <Button onClick={handleSubmit} className="ml-auto">
              <CheckCircle className="w-4 h-4 mr-2" />
              Assigner
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
