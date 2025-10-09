// AcademicYearOverview.tsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Calendar,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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
    academicStudents: any[];
  }>();

  const {
    academicYear,
    educationSystem,
    level,
    class: classId,
    term,
    sequence,
    subject,
    academicStudents = []
  } = context;

  // Calculate statistics
  const totalStudents = academicStudents.length;
  const totalSubjects = academicStudents[0]?.subjects?.length || 0;
  const averageGrade = academicStudents.length > 0 
    ? (academicStudents.reduce((sum, student) => sum + (student.average || 0), 0) / academicStudents.length).toFixed(2)
    : '-';
  const bestStudent = academicStudents.length > 0 
    ? academicStudents.reduce((best, current) => 
        (current.average || 0) > (best.average || 0) ? current : best
      )
    : null;

  const getPerformanceColor = (average: number) => {
    if (average >= 16) return 'text-green-600';
    if (average >= 14) return 'text-blue-600';
    if (average >= 12) return 'text-yellow-600';
    if (average >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (average: number) => {
    if (average >= 16) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (average >= 14) return <Badge className="bg-blue-100 text-blue-800">Très Bien</Badge>;
    if (average >= 12) return <Badge className="bg-yellow-100 text-yellow-800">Bien</Badge>;
    if (average >= 10) return <Badge className="bg-orange-100 text-orange-800">Moyen</Badge>;
    return <Badge className="bg-red-100 text-red-800">À Améliorer</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
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
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matières</p>
                  <p className="text-2xl font-bold">{totalSubjects}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Moyenne Générale</p>
                  <p className="text-2xl font-bold">{averageGrade}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <Award className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meilleur élève</p>
                  <p className="text-lg font-bold">
                    {bestStudent ? `${bestStudent.firstName} ${bestStudent.lastName}` : '-'}
                  </p>
                  {bestStudent && (
                    <p className="text-sm text-muted-foreground">
                      {bestStudent.average?.toFixed(2)}/20
                    </p>
                  )}
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

      {/* Students Table */}
      {academicYear && academicStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Liste des Élèves</span>
            </CardTitle>
            <CardDescription>
              {academicStudents.length} élève(s) trouvé(s) pour les critères sélectionnés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Élève</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Moyenne</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                    <TableHead className="text-center">Rang</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicStudents.map((student, index) => (
                    <TableRow key={student.id || student._id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {student?.student.firstName} {student.student.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.student.matricule || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {student.email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <span>{student.email}</span>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                          {student.address && (
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">{student.address}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.average ? (
                          <span className={`text-lg font-semibold ${getPerformanceColor(student.average)}`}>
                            {student.average.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.average ? getPerformanceBadge(student.average) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.rank ? (
                          <Badge variant="outline" className="font-mono">
                            #{student.rank}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={student.status === 'active' ? 'default' : 'secondary'}
                          className={
                            student.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {student.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty state for table */}
            {academicStudents.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun élève trouvé</h3>
                <p className="text-muted-foreground">
                  Aucun élève ne correspond aux filtres sélectionnés.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No students message when filters are selected but no students */}
      {academicYear && academicStudents.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun élève disponible</h3>
              <p className="text-muted-foreground mb-4">
                Aucun élève n'a été trouvé pour les critères de filtrage sélectionnés.
              </p>
              <div className="flex justify-center space-x-2">
                <Badge variant="outline">Année: {academicYear}</Badge>
                {educationSystem && <Badge variant="outline">Système: {educationSystem}</Badge>}
                {level && <Badge variant="outline">Niveau: {level}</Badge>}
                {classId && <Badge variant="outline">Classe: {classId}</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicYearOverview;