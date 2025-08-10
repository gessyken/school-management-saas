
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
  CreditCard,
  Receipt,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

const mockPayments = [
  { 
    id: 1, 
    student: 'Ndongo Jean',
    class: '6ème A',
    amount: 75000,
    date: '2024-04-15',
    type: 'Frais de scolarité',
    status: 'Validé'
  },
  { 
    id: 2, 
    student: 'THIERRY WAMBARA',
    class: '5ème B',
    amount: 50000,
    date: '2024-04-14',
    type: 'Acompte',
    status: 'En attente'
  },
  { 
    id: 3, 
    student: 'NDE FERRY ',
    class: '4ème A',
    amount: 100000,
    date: '2024-04-13',
    type: 'Frais de scolarité',
    status: 'Validé'
  },
  { 
    id: 4, 
    student: 'Marie Nkodo',
    class: '3ème C',
    amount: 25000,
    date: '2024-04-12',
    type: 'Acompte',
    status: 'Validé'
  },
];

const SecretaryPayments = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Paiements</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Exporter
            </Button>
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau paiement
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total encaissé aujourd'hui</CardTitle>
              <div className="text-2xl font-bold">125.000 FCFA</div>
            </CardHeader>
          </Card>
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paiements en attente</CardTitle>
              <div className="text-2xl font-bold">3</div>
            </CardHeader>
          </Card>
          <Card className="bg-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total du mois</CardTitle>
              <div className="text-2xl font-bold">2.450.000 FCFA</div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un paiement..."
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Élève</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="font-medium">{payment.student}</TableCell>
                    <TableCell>{payment.class}</TableCell>
                    <TableCell>{payment.type}</TableCell>
                    <TableCell>{payment.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={payment.status === 'Validé' ? 
                          "bg-skyblue/10 text-skyblue border-skyblue/30" : 
                          "bg-mustard/10 text-mustard border-mustard/30"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Receipt className="h-4 w-4" />
                        </Button>
                        {payment.status === 'En attente' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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

export default SecretaryPayments;
