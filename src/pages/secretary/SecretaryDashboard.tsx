
import React from 'react';
import { 
  Users, 
  School, 
  CreditCard, 
  AlertCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SecretaryDashboard = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord - Secrétaire</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Effectif total"
            value="312"
            description="Élèves inscrits"
            icon={Users}
          />
          <StatsCard
            title="Nombre de classes"
            value="12"
            icon={School}
          />
          <StatsCard
            title="Paiements en attente"
            value="32"
            description="À traiter cette semaine"
            icon={CreditCard}
          />
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Tâches à effectuer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-md border border-secondary/30">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-secondary mr-3" />
                  <span>Valider les inscriptions (12)</span>
                </div>
                <Button size="sm" variant="outline">Traiter</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md border border-primary/30">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <span>Paiements à enregistrer (8)</span>
                </div>
                <Button size="sm" variant="outline">Traiter</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-md border border-secondary/30">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-secondary mr-3" />
                  <span>Mettre à jour les fiches élèves</span>
                </div>
                <Button size="sm" variant="outline">Traiter</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Classes à compléter</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {['6ème A', '5ème B', '4ème A', 'Terminale C'].map((className) => (
                  <li key={className} className="p-3 border rounded-md flex justify-between items-center">
                    <span>{className}</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary">En attente</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default SecretaryDashboard;
