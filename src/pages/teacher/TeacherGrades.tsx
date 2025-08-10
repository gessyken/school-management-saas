
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Save, FileSpreadsheet } from 'lucide-react';

const mockStudents = [
  { id: 1, name: 'Aimé Ndongo', class: '6ème A', grades: [16, null, null] },
  { id: 2, name: 'Fatima Aboubakar', class: '6ème A', grades: [14, null, null] },
  { id: 3, name: 'Jean Kamga', class: '6ème A', grades: [12, null, null] },
  { id: 4, name: 'Marie Nkodo', class: '6ème A', grades: [15, null, null] },
  { id: 5, name: 'Paul Biya', class: '6ème A', grades: [18, null, null] },
];

const TeacherGrades = () => {
  const [selectedClass, setSelectedClass] = useState('6A');
  const [selectedSubject, setSelectedSubject] = useState('mathematiques');
  const [search, setSearch] = useState('');

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Saisie des Notes</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Exporter
            </Button>
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Moyenne de classe</CardTitle>
              <div className="text-2xl font-bold">14.5/20</div>
            </CardHeader>
          </Card>
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Notes saisies</CardTitle>
              <div className="text-2xl font-bold">5/25</div>
            </CardHeader>
          </Card>
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Notes manquantes</CardTitle>
              <div className="text-2xl font-bold">20</div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Saisie des notes</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6A">6ème A</SelectItem>
                  <SelectItem value="5B">5ème B</SelectItem>
                  <SelectItem value="4A">4ème A</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematiques">Mathématiques</SelectItem>
                  <SelectItem value="francais">Français</SelectItem>
                  <SelectItem value="anglais">Anglais</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un élève..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Élève</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Séquence 1</TableHead>
                  <TableHead>Séquence 2</TableHead>
                  <TableHead>Séquence 3</TableHead>
                  <TableHead>Moyenne</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    {student.grades.map((grade, index) => (
                      <TableCell key={index}>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          placeholder="--"
                          value={grade || ''}
                          className="w-16"
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10">
                        {student.grades[0] ? `${student.grades[0]}/20` : '--'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TeacherGrades;
