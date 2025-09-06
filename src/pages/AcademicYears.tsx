import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Users, BookOpen, TrendingUp, Edit, Eye, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { academicYearsService } from '@/services/academicYearsService';
import { useToast } from '@/hooks/use-toast';

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  studentCount: number;
  classCount: number;
  averageGrade: number;
  terms: Term[];
}

const AcademicYears: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        setIsLoading(true);
        const data = await academicYearsService.getAcademicYears();
        setAcademicYears(data || []);
        if (data && data.length > 0) {
          setSelectedYear(data[0].id);
        }
      } catch (e) {
        console.error(e);
        toast({ title: 'Données années académiques indisponibles', description: 'Les données seront affichées dès qu\'elles seront disponibles.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadAcademicYears();
  }, [toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success">En cours</Badge>;
      case 'upcoming':
        return <Badge className="bg-primary">À venir</Badge>;
      case 'completed':
        return <Badge variant="secondary">Terminée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const currentYear = academicYears.find(year => year.id === selectedYear);

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Années académiques</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des années scolaires et des trimestres
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Archive className="w-4 h-4 mr-2" />
            Archiver
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle année
          </Button>
        </div>
      </div>

      {/* Sélecteur d'année */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {academicYears.map((year) => (
              <button
                key={year.id}
                onClick={() => setSelectedYear(year.id)}
                className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                  selectedYear === year.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{year.name}</h3>
                  {getStatusBadge(year.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(year.startDate)} - {formatDate(year.endDate)}
                </p>
                {year.studentCount > 0 && (
                  <div className="mt-3 flex space-x-4 text-sm">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-primary" />
                      {year.studentCount}
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1 text-secondary" />
                      {year.classCount}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-success" />
                      {year.averageGrade.toFixed(1)}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Détail de l'année sélectionnée */}
      {currentYear && (
        <>
          {/* Statistiques de l'année */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Élèves</p>
                    <p className="text-3xl font-bold text-primary">{currentYear.studentCount}</p>
                  </div>
                  <Users className="w-10 h-10 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Classes</p>
                    <p className="text-3xl font-bold text-secondary">{currentYear.classCount}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-secondary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Moyenne générale</p>
                    <p className="text-3xl font-bold text-success">
                      {currentYear.averageGrade > 0 ? currentYear.averageGrade.toFixed(1) : '--'}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trimestres</p>
                    <p className="text-3xl font-bold text-warning">{currentYear.terms.length}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestion des trimestres */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trimestres de l'année {currentYear.name}</CardTitle>
                  <CardDescription>
                    Gestion des périodes d'évaluation et des calendriers
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter trimestre
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {currentYear.terms.map((term, index) => (
                  <div
                    key={term.id}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      term.isActive
                        ? 'border-success bg-success/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          term.isActive
                            ? 'bg-success text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{term.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(term.startDate)} - {formatDate(term.endDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {term.isActive && (
                          <Badge variant="default" className="bg-success">
                            Trimestre actuel
                          </Badge>
                        )}
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {term.isActive && null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Accès direct aux fonctionnalités importantes pour cette année
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Users className="w-6 h-6" />
                  <span>Affecter élèves</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <BookOpen className="w-6 h-6" />
                  <span>Saisir notes</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span>Planning</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>Statistiques</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AcademicYears;