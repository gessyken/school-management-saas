import React, { useState } from 'react';
import { Plus, Search, Users, BookOpen, TrendingUp, Calendar, Eye, Edit, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClassRoom {
  id: string;
  name: string;
  level: string;
  section: string;
  studentCount: number;
  maxStudents: number;
  mainTeacher: string;
  subjects: string[];
  averageGrade: number;
  attendanceRate: number;
  room: string;
  schedule: string;
}

const Classes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const classes: ClassRoom[] = [
    {
      id: '1',
      name: '6ème A',
      level: '6ème',
      section: 'A',
      studentCount: 28,
      maxStudents: 30,
      mainTeacher: 'Mme Dubois',
      subjects: ['Mathématiques', 'Français', 'Histoire-Géo', 'Sciences', 'Anglais'],
      averageGrade: 14.2,
      attendanceRate: 94,
      room: 'Salle 201',
      schedule: 'Lun-Ven 8h-16h',
    },
    {
      id: '2',
      name: '6ème B',
      level: '6ème',
      section: 'B',
      studentCount: 25,
      maxStudents: 30,
      mainTeacher: 'M. Martin',
      subjects: ['Mathématiques', 'Français', 'Histoire-Géo', 'Sciences', 'Anglais'],
      averageGrade: 13.8,
      attendanceRate: 91,
      room: 'Salle 202',
      schedule: 'Lun-Ven 8h-16h',
    },
    {
      id: '3',
      name: '5ème A',
      level: '5ème',
      section: 'A',
      studentCount: 30,
      maxStudents: 32,
      mainTeacher: 'Mme Bernard',
      subjects: ['Mathématiques', 'Français', 'Histoire-Géo', 'Sciences Physiques', 'Anglais', 'Espagnol'],
      averageGrade: 15.1,
      attendanceRate: 96,
      room: 'Salle 301',
      schedule: 'Lun-Ven 8h-17h',
    },
    {
      id: '4',
      name: '5ème B',
      level: '5ème',
      section: 'B',
      studentCount: 27,
      maxStudents: 32,
      mainTeacher: 'M. Petit',
      subjects: ['Mathématiques', 'Français', 'Histoire-Géo', 'Sciences Physiques', 'Anglais', 'Allemand'],
      averageGrade: 14.6,
      attendanceRate: 93,
      room: 'Salle 302',
      schedule: 'Lun-Ven 8h-17h',
    },
    {
      id: '5',
      name: '4ème A',
      level: '4ème',
      section: 'A',
      studentCount: 24,
      maxStudents: 28,
      mainTeacher: 'Mme Moreau',
      subjects: ['Mathématiques', 'Français', 'Histoire-Géo', 'Sciences Physiques', 'Anglais', 'Latin'],
      averageGrade: 13.9,
      attendanceRate: 89,
      room: 'Salle 401',
      schedule: 'Lun-Ven 8h-17h',
    },
  ];

  const levels = ['Tous les niveaux', '6ème', '5ème', '4ème', '3ème'];

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-success';
    if (grade >= 14) return 'text-primary';
    if (grade >= 12) return 'text-warning';
    return 'text-destructive';
  };

  const getCapacityBadge = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return <Badge variant="destructive">Pleine</Badge>;
    if (percentage >= 75) return <Badge className="bg-warning">Presque pleine</Badge>;
    return <Badge variant="default" className="bg-success">Disponible</Badge>;
  };

  const filteredClasses = classes.filter((classroom) => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classroom.mainTeacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || filterLevel === 'Tous les niveaux' || 
                        classroom.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des classes</h1>
          <p className="text-muted-foreground mt-2">
            {classes.length} classes • {classes.reduce((acc, c) => acc + c.studentCount, 0)} étudiants au total
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Planning
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle classe
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-primary">{classes.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
                <p className="text-2xl font-bold text-secondary">
                  {classes.reduce((acc, c) => acc + c.studentCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne générale</p>
                <p className="text-2xl font-bold text-success">
                  {(classes.reduce((acc, c) => acc + c.averageGrade, 0) / classes.length).toFixed(1)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux présence</p>
                <p className="text-2xl font-bold text-warning">
                  {Math.round(classes.reduce((acc, c) => acc + c.attendanceRate, 0) / classes.length)}%
                </p>
              </div>
              <Calendar className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {levels.map((level) => (
                <option key={level} value={level === 'Tous les niveaux' ? 'all' : level}>
                  {level}
                </option>
              ))}
            </select>

            <Button variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille des classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map((classroom) => (
          <Card key={classroom.id} className="shadow-card hover:shadow-elevated transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{classroom.name}</CardTitle>
                  <CardDescription>
                    Professeur principal : {classroom.mainTeacher}
                  </CardDescription>
                </div>
                {getCapacityBadge(classroom.studentCount, classroom.maxStudents)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4 py-3 border-y border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{classroom.studentCount}</p>
                  <p className="text-xs text-muted-foreground">Étudiants</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getGradeColor(classroom.averageGrade)}`}>
                    {classroom.averageGrade.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Moyenne</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{classroom.attendanceRate}%</p>
                  <p className="text-xs text-muted-foreground">Présence</p>
                </div>
              </div>

              {/* Informations */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salle :</span>
                  <span className="font-medium">{classroom.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horaires :</span>
                  <span className="font-medium">{classroom.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacité :</span>
                  <span className="font-medium">{classroom.studentCount}/{classroom.maxStudents}</span>
                </div>
              </div>

              {/* Matières */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Matières enseignées :</p>
                <div className="flex flex-wrap gap-1">
                  {classroom.subjects.slice(0, 3).map((subject) => (
                    <Badge key={subject} variant="outline" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                  {classroom.subjects.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{classroom.subjects.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="w-4 h-4 mr-2" />
                  Élèves
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredClasses.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune classe trouvée</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou créez une nouvelle classe.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Classes;