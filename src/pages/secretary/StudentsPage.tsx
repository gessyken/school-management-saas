
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  FileSpreadsheet, 
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Mock data for students
const mockStudents = [
  { 
    id: '1', 
    firstName: 'Jean', 
    lastName: 'Ndongo', 
    gender: 'M', 
    class: '6ème A', 
    birthDate: '12/05/2011', 
    parentPhone: '+237 691234567',
    paymentStatus: 'Complet' 
  },
  { 
    id: '2', 
    firstName: 'THIERRY ', 
    lastName: 'WAMBARA', 
    gender: 'F', 
    class: '5ème B', 
    birthDate: '23/08/2010', 
    parentPhone: '+237 677654321',
    paymentStatus: 'Partiel' 
  },
  { 
    id: '3', 
    firstName: 'FERRY', 
    lastName: 'NDE ', 
    gender: 'M', 
    class: '4ème A', 
    birthDate: '05/03/2009', 
    parentPhone: '+237 698765432',
    paymentStatus: 'En retard' 
  },
  { 
    id: '4', 
    firstName: 'Marie', 
    lastName: 'Nkodo', 
    gender: 'F', 
    class: '3ème C', 
    birthDate: '17/11/2008', 
    parentPhone: '+237 677889900',
    paymentStatus: 'Complet' 
  },
  { 
    id: '5', 
    firstName: 'Paul', 
    lastName: 'Biya', 
    gender: 'M', 
    class: 'Terminale D', 
    birthDate: '30/06/2005', 
    parentPhone: '+237 699112233',
    paymentStatus: 'Partiel' 
  },
];

const StudentsPage = () => {
  const [search, setSearch] = useState('');
  
  const filteredStudents = mockStudents.filter(
    student => 
      student.firstName.toLowerCase().includes(search.toLowerCase()) ||
      student.lastName.toLowerCase().includes(search.toLowerCase()) ||
      student.class.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Élèves</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Importer
            </Button>
            <Button className="bg-skyblue hover:bg-skyblue/90 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvel élève
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Liste des élèves</CardTitle>
            <div className="flex items-center gap-2 mt-2">
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Date de naissance</TableHead>
                    <TableHead>Contact parent</TableHead>
                    <TableHead>Statut paiement</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun élève trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.lastName} {student.firstName}
                        </TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>{student.birthDate}</TableCell>
                        <TableCell>{student.parentPhone}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              student.paymentStatus === 'Complet' 
                                ? "bg-skyblue/10 text-skyblue border-skyblue/30" 
                                : student.paymentStatus === 'Partiel'
                                  ? "bg-mustard/10 text-mustard border-mustard/30"
                                  : "bg-mustard/20 text-mustard border-mustard/30"
                            }
                          >
                            {student.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Eye className="h-4 w-4" /> Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Pencil className="h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 text-mustard">
                                <Trash2 className="h-4 w-4" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StudentsPage;
