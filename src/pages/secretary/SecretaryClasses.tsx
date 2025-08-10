
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Users,
  Pencil,
  Trash2,
  MoreHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockClasses = [
  { 
    id: 1, 
    name: '6ème A', 
    students: 35, 
    capacity: 40,
    fees: 150000,
    status: 'Complet'
  },
  { 
    id: 2, 
    name: '5ème B', 
    students: 32, 
    capacity: 40,
    fees: 150000,
    status: 'Ouvert'
  },
  { 
    id: 3, 
    name: '4ème A', 
    students: 38, 
    capacity: 40,
    fees: 175000,
    status: 'Complet'
  },
  { 
    id: 4, 
    name: '3ème C', 
    students: 36, 
    capacity: 45,
    fees: 175000,
    status: 'Ouvert'
  },
];

const SecretaryClasses = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Classes</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Importer
            </Button>
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle classe
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total des classes</CardTitle>
              <div className="text-2xl font-bold">{mockClasses.length}</div>
            </CardHeader>
          </Card>
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Places disponibles</CardTitle>
              <div className="text-2xl font-bold">
                {mockClasses.reduce((acc, curr) => acc + (curr.capacity - curr.students), 0)}
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Classes complètes</CardTitle>
              <div className="text-2xl font-bold">
                {mockClasses.filter(c => c.status === 'Complet').length}
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des classes</CardTitle>
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une classe..."
                className="pl-10 max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead>Effectif</TableHead>
                  <TableHead>Places disponibles</TableHead>
                  <TableHead>Frais de scolarité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClasses.map((classe) => (
                  <TableRow key={classe.id}>
                    <TableCell className="font-medium">{classe.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {classe.students}/{classe.capacity}
                      </div>
                    </TableCell>
                    <TableCell>{classe.capacity - classe.students}</TableCell>
                    <TableCell>{classe.fees.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={classe.status === 'Complet' ? 
                          "bg-mustard/10 text-mustard border-mustard/30" : 
                          "bg-skyblue/10 text-skyblue border-skyblue/30"
                        }
                      >
                        {classe.status}
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
                            <Pencil className="h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 text-mustard">
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default SecretaryClasses;
