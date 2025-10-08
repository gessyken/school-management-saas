// AcademicYearOverview.tsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, TrendingUp, Award, Calendar } from "lucide-react";

const AcademicYearOverview: React.FC = () => {
  const context = useOutletContext<{
    academicYear: string;
    educationSystem: string;
    level: string;
    class: string;
    term: string;
    sequence: string;
    subject: string;
    tab: string;
  }>();

  const {
    academicYear,
    educationSystem,
    level,
    class: classId,
    term,
    sequence,
    subject
  } = context;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble académique</CardTitle>
          <CardDescription>
            Résumé des données académiques basé sur les filtres sélectionnés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Élèves</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matières</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Moyenne Générale</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <Award className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meilleur élève</p>
                  <p className="text-lg font-bold">-</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Filters Display */}
          {(academicYear || educationSystem || level || classId || term || sequence || subject) && (
            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Filtres actifs:</h3>
              <div className="flex flex-wrap gap-2">
                {academicYear && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Année: {academicYear}</span>
                  </Badge>
                )}
                {educationSystem && (
                  <Badge variant="secondary">
                    Système: {educationSystem}
                  </Badge>
                )}
                {level && (
                  <Badge variant="secondary">
                    Niveau: {level}
                  </Badge>
                )}
                {classId && (
                  <Badge variant="secondary">
                    Classe: {classId}
                  </Badge>
                )}
                {term && (
                  <Badge variant="secondary">
                    Terme: {term}
                  </Badge>
                )}
                {sequence && (
                  <Badge variant="secondary">
                    Séquence: {sequence}
                  </Badge>
                )}
                {subject && (
                  <Badge variant="secondary">
                    Matière: {subject}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!academicYear && (
            <div className="mt-6 p-6 text-center border-2 border-dashed rounded-lg">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sélectionnez une année académique</h3>
              <p className="text-muted-foreground">
                Commencez par sélectionner une année académique pour voir les données de vue d'ensemble.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicYearOverview;