
import React from 'react';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  CheckCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TeacherDashboard = () => {
  // Sample data
  const classesData = [
    { id: 1, name: '6ème A', subject: 'Mathématiques', status: 'À faire' },
    { id: 2, name: '5ème B', subject: 'Mathématiques', status: 'Complété' },
    { id: 3, name: '4ème A', subject: 'Mathématiques', status: 'En cours' },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord - Enseignant</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Mes classes"
            value="3"
            icon={BookOpen}
          />
          <StatsCard
            title="Élèves totaux"
            value="87"
            icon={Users}
          />
          <StatsCard
            title="Notes à saisir"
            value="2"
            description="Classes en attente"
            icon={ClipboardList}
          />
        </div>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Saisie des notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classesData.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <div className="font-medium">{classItem.name}</div>
                    <div className="text-sm text-muted-foreground">{classItem.subject}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={
                        classItem.status === 'Complété' 
                          ? "bg-primary/10 text-primary border-primary/30" 
                          : classItem.status === 'En cours'
                            ? "bg-secondary/10 text-secondary border-secondary/30"
                            : "bg-primary/10 text-primary border-primary/30"
                      }
                    >
                      {classItem.status === 'Complété' && (
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      {classItem.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      {classItem.status === 'Complété' ? 'Voir' : 'Saisir'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Calendrier des évaluations</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-muted rounded border">
              <p className="text-muted-foreground">Calendrier des prochaines évaluations</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Statistiques de réussite</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-muted rounded border">
              <p className="text-muted-foreground">Graphique des statistiques de réussite</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TeacherDashboard;
