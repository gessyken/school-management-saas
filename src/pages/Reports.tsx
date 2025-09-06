import React, { useEffect, useState } from 'react';
import { FileText, Download, Eye, Filter, Users, BarChart3, PieChart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { reportsService } from '@/services/reportsService';
import { useToast } from '@/hooks/use-toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'bulletin' | 'class' | 'school' | 'statistics';
  icon: any;
  color: string;
  generated: number;
  lastGenerated: string;
}

const Reports: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('2');
  const [selectedClass, setSelectedClass] = useState('all');
  const { toast } = useToast();

  // States for real data (initially empty)
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Resolve an icon value that may come as a component, a string key, or be undefined
  const resolveIcon = (icon: any) => {
    if (typeof icon === 'function') return icon; // already a component
    if (typeof icon === 'object' && icon && typeof icon.type === 'function') return icon.type;
    if (typeof icon === 'string') {
      const key = icon.toLowerCase();
      const map: Record<string, any> = {
        file: FileText,
        filetext: FileText,
        document: FileText,
        pie: PieChart,
        piechart: PieChart,
        chart: BarChart3,
        barchart: BarChart3,
        users: Users,
      };
      return map[key] || FileText;
    }
    return FileText;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [templatesRes, termsRes, classesRes, recentRes] = await Promise.all([
          reportsService.getTemplates().catch(() => []),
          reportsService.getTerms().catch(() => []),
          reportsService.getClasses().catch(() => []),
          reportsService.getRecentReports().catch(() => []),
        ]);

        setReportTemplates(Array.isArray(templatesRes) ? templatesRes : []);
        setTerms(Array.isArray(termsRes) ? termsRes : []);
        setClasses(Array.isArray(classesRes) ? classesRes : []);
        setRecentReports(Array.isArray(recentRes) ? recentRes : []);
      } catch (e) {
        console.error(e);
        toast({ title: 'Données de rapports indisponibles', description: 'Les données seront affichées dès qu\'elles seront disponibles.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bulletin': return 'bg-primary';
      case 'class': return 'bg-secondary';
      case 'school': return 'bg-success';
      case 'statistics': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'bulletin': return 'Bulletin';
      case 'class': return 'Classe';
      case 'school': return 'École';
      case 'statistics': return 'Statistiques';
      default: return 'Rapport';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bulletins et Rapports</h1>
          <p className="text-muted-foreground mt-2">
            Génération et gestion des documents scolaires
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Programmation
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Download className="w-4 h-4 mr-2" />
            Génération groupée
          </Button>
        </div>
      </div>

      {/* Paramètres de génération */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Paramètres de génération</CardTitle>
          <CardDescription>
            Sélectionnez la période et les classes pour la génération des rapports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Trimestre</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Classe</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Array.isArray(classes) && classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Aperçu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modèles de rapports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Types de rapports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Array.isArray(reportTemplates) ? reportTemplates : []).map((template) => {
            const Icon = resolveIcon(template.icon);
            return (
              <Card key={template.id} className="shadow-card hover:shadow-elevated transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: template.color }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.generated} générés
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  
                  <div className="text-xs text-muted-foreground mb-4">
                    Dernière génération : {new Date(template.lastGenerated).toLocaleDateString('fr-FR')}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Aperçu
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-primary hover:bg-primary-hover">
                      <Download className="w-4 h-4 mr-2" />
                      Générer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Rapports récents */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rapports générés récemment</CardTitle>
              <CardDescription>
                Historique des derniers documents créés
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Voir tout l'historique
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${getTypeColor(report.type)}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{report.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Généré le {new Date(report.generated).toLocaleDateString('fr-FR')} à {new Date(report.generated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span>{report.studentCount} élèves</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {getTypeName(report.type)}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques de génération */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ce mois</p>
                <p className="text-3xl font-bold text-primary">156</p>
                <p className="text-xs text-muted-foreground mt-1">rapports générés</p>
              </div>
              <FileText className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bulletins envoyés</p>
                <p className="text-3xl font-bold text-success">1,089</p>
                <p className="text-xs text-muted-foreground mt-1">sur 1,247 total</p>
              </div>
              <Users className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taille totale</p>
                <p className="text-3xl font-bold text-secondary">24.8</p>
                <p className="text-xs text-muted-foreground mt-1">MB stockés</p>
              </div>
              <BarChart3 className="w-10 h-10 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;