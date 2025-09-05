import React, { useState } from 'react';
import { Plus, Search, BookOpen, Users, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  coefficient: number;
  color: string;
  classCount: number;
  teacherName: string;
  status: 'active' | 'inactive';
  totalHours: number;
}

const Subjects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const subjects: Subject[] = [
    {
      id: '1',
      name: 'Mathématiques',
      code: 'MATH',
      description: 'Algèbre, géométrie et analyse mathématique',
      coefficient: 4,
      color: '#A8D8EA',
      classCount: 8,
      teacherName: 'M. Dubois',
      status: 'active',
      totalHours: 120,
    },
    {
      id: '2',
      name: 'Français',
      code: 'FR',
      description: 'Langue française, littérature et expression écrite',
      coefficient: 4,
      color: '#D4AC0D',
      classCount: 8,
      teacherName: 'Mme Martin',
      status: 'active',
      totalHours: 100,
    },
    {
      id: '3',
      name: 'Histoire-Géographie',
      code: 'HG',
      description: 'Histoire contemporaine et géographie mondiale',
      coefficient: 3,
      color: '#28A745',
      classCount: 6,
      teacherName: 'M. Bernard',
      status: 'active',
      totalHours: 80,
    },
    {
      id: '4',
      name: 'Sciences Physiques',
      code: 'SPC',
      description: 'Physique et chimie expérimentale',
      coefficient: 3,
      color: '#FD7E14',
      classCount: 5,
      teacherName: 'Mme Petit',
      status: 'active',
      totalHours: 90,
    },
    {
      id: '5',
      name: 'Anglais',
      code: 'ANG',
      description: 'Langue vivante étrangère - Anglais',
      coefficient: 3,
      color: '#DC3545',
      classCount: 7,
      teacherName: 'M. Wilson',
      status: 'inactive',
      totalHours: 60,
    },
  ];

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-success">Actif</Badge>
    ) : (
      <Badge variant="destructive">Inactif</Badge>
    );
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || subject.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des matières</h1>
          <p className="text-muted-foreground mt-2">
            {subjects.length} matières • {filteredSubjects.length} affichées
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Import CSV
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle matière
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>

            <Button variant="outline" className="w-full">
              Statistiques par matière
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille des matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="shadow-card hover:shadow-elevated transition-all duration-200 group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: subject.color }}
                >
                  {subject.code}
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <CardDescription className="mt-1">
                  {subject.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{subject.classCount} classes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{subject.totalHours}h/an</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Enseignant :</span>
                  <span className="font-medium">{subject.teacherName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coefficient :</span>
                  <span className="font-bold text-primary">{subject.coefficient}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Statut :</span>
                  {getStatusBadge(subject.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredSubjects.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune matière trouvée</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou ajoutez une nouvelle matière.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Subjects;