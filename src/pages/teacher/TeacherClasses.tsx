
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Users, FileSpreadsheet } from 'lucide-react';

const mockClasses = [
  { id: 1, name: '6ème A', students: 35, subjects: ['Mathématiques', 'Français', 'Histoire'] },
  { id: 2, name: '5ème B', students: 32, subjects: ['Mathématiques', 'Anglais'] },
  { id: 3, name: '4ème A', students: 38, subjects: ['Sciences', 'Français'] },
  { id: 4, name: '3ème C', students: 36, subjects: ['Mathématiques', 'Physique'] },
];

const TeacherClasses = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mes Classes</h1>
          <Button variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exporter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classes assignées</CardTitle>
              <div className="text-2xl font-bold">{mockClasses.length}</div>
            </CardHeader>
          </Card>
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total élèves</CardTitle>
              <div className="text-2xl font-bold">
                {mockClasses.reduce((acc, curr) => acc + curr.students, 0)}
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Matières enseignées</CardTitle>
              <div className="text-2xl font-bold">3</div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des classes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead>Effectif</TableHead>
                  <TableHead>Matières enseignées</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClasses.map((classe) => (
                  <TableRow key={classe.id}>
                    <TableCell className="font-medium">{classe.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {classe.students} élèves
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {classe.subjects.map((subject) => (
                          <Badge key={subject} variant="outline" className="bg-primary/10">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        Voir le cahier
                      </Button>
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

export default TeacherClasses;
