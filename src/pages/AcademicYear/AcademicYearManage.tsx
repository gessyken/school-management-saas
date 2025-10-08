import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { academicYearService } from '@/services/academicYearService';
import { useToast } from '@/hooks/use-toast';
import { AcademicYear } from '@/types/academicYear';
import CreateAcademicYearModal from '../components/CreateAcademicYearModal';

const AcademicYearManage: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      setIsLoading(true);
      const years = await academicYearService.getAcademicYears();
      setAcademicYears(years);
    } catch (error) {
      console.error('Error loading academic years:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les années académiques',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateYear = async (yearData: any) => {
    try {
      // Implementation for creating academic year
      await loadAcademicYears(); // Refresh list
      setShowCreateModal(false);
      toast({
        title: 'Succès',
        description: 'Année académique créée avec succès'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'année académique',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Completed':
        return <Badge variant="secondary">Terminée</Badge>;
      case 'Withdrawn':
        return <Badge variant="outline">Retirée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des années académiques</h1>
          <p className="text-muted-foreground mt-2">
            Créer et gérer les années scolaires
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle année
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Années actives</p>
                <p className="text-3xl font-bold text-primary">
                  {academicYears.filter(y => y.status === 'Active').length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total élèves</p>
                <p className="text-3xl font-bold text-secondary">
                  {academicYears.reduce((sum, year) => sum + (year.studentCount || 0), 0)}
                </p>
              </div>
              <Users className="w-10 h-10 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total classes</p>
                <p className="text-3xl font-bold text-success">
                  {academicYears.reduce((sum, year) => sum + (year.classCount || 0), 0)}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Years Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des années académiques</CardTitle>
          <CardDescription>
            Toutes les années académiques configurées dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Année</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Élèves</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Moyenne</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicYears.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-semibold">{year.year}</TableCell>
                  <TableCell>
                    {formatDate(year.startDate)} - {formatDate(year.endDate)}
                  </TableCell>
                  <TableCell>{getStatusBadge(year.status)}</TableCell>
                  <TableCell>{year.studentCount || 0}</TableCell>
                  <TableCell>{year.classCount || 0}</TableCell>
                  <TableCell>
                    {year.overallAverage ? year.overallAverage.toFixed(1) : '--'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={year.status === 'Active'}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {academicYears.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune année académique créée
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <CreateAcademicYearModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateYear}
      />
    </div>
  );
};

export default AcademicYearManage;