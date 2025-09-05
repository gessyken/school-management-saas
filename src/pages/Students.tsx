import React, { useState } from 'react';
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  average: number;
  status: 'active' | 'inactive' | 'graduated';
  enrollmentDate: string;
  avatar?: string;
}

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Données de démonstration
  const students: Student[] = [
    {
      id: '1',
      name: 'Marie Dubois',
      email: 'marie.dubois@email.fr',
      phone: '06 12 34 56 78',
      class: '6ème A',
      average: 15.2,
      status: 'active',
      enrollmentDate: '2023-09-01',
    },
    {
      id: '2',
      name: 'Thomas Martin',
      email: 'thomas.martin@email.fr',
      phone: '06 87 65 43 21',
      class: '5ème B',
      average: 13.8,
      status: 'active',
      enrollmentDate: '2022-09-01',
    },
    {
      id: '3',
      name: 'Sophie Bernard',
      email: 'sophie.bernard@email.fr',
      phone: '06 55 44 33 22',
      class: '4ème A',
      average: 16.5,
      status: 'active',
      enrollmentDate: '2021-09-01',
    },
    {
      id: '4',
      name: 'Lucas Petit',
      email: 'lucas.petit@email.fr',
      phone: '06 99 88 77 66',
      class: '3ème C',
      average: 11.2,
      status: 'active',
      enrollmentDate: '2020-09-01',
    },
  ];

  const classes = ['Toutes les classes', '6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '3ème C'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success">Actif</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactif</Badge>;
      case 'graduated':
        return <Badge variant="secondary">Diplômé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getAverageColor = (average: number) => {
    if (average >= 16) return 'text-success';
    if (average >= 14) return 'text-primary';
    if (average >= 12) return 'text-warning';
    return 'text-destructive';
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || selectedClass === 'Toutes les classes' || 
                        student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des étudiants</h1>
          <p className="text-muted-foreground mt-2">
            {students.length} étudiants inscrits • {filteredStudents.length} affichés
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un étudiant
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par classe */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {classes.map((className) => (
                <option key={className} value={className === 'Toutes les classes' ? 'all' : className}>
                  {className}
                </option>
              ))}
            </select>

            {/* Actions */}
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des étudiants */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="shadow-card hover:shadow-elevated transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Informations principales */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {student.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {student.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {student.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Classe</p>
                    <p className="font-semibold">{student.class}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Moyenne</p>
                    <p className={`font-bold text-lg ${getAverageColor(student.average)}`}>
                      {student.average.toFixed(1)}/20
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    {getStatusBadge(student.status)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-6">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredStudents.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucun étudiant trouvé</h3>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche ou ajoutez un nouvel étudiant.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Students;