import React, { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, CreditCard, AlertCircle, Eye, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import FeeModal from '@/components/modals/FeeModal';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  studentName: string;
  class: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  paidAmount?: number;
}

const Finances: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [feeModal, setFeeModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit' | 'view', fee: null as any });
  const { toast } = useToast();

  const payments: Payment[] = [
    {
      id: '1',
      studentName: 'Marie Dubois',
      class: '6ème A',
      feeType: 'Frais de scolarité',
      amount: 850,
      dueDate: '2024-02-15',
      paidDate: '2024-02-10',
      status: 'paid',
    },
    {
      id: '2',
      studentName: 'Thomas Martin',
      class: '5ème B',
      feeType: 'Frais de scolarité',
      amount: 850,
      dueDate: '2024-02-15',
      status: 'pending',
    },
    {
      id: '3',
      studentName: 'Sophie Bernard',
      class: '4ème A',
      feeType: 'Frais d\'inscription',
      amount: 200,
      dueDate: '2024-01-30',
      status: 'overdue',
    },
    {
      id: '4',
      studentName: 'Lucas Petit',
      class: '3ème C',
      feeType: 'Frais de scolarité',
      amount: 850,
      dueDate: '2024-02-15',
      paidDate: '2024-02-12',
      paidAmount: 500,
      status: 'partial',
    },
  ];

  const financialOverview = [
    { name: 'Jan', revenus: 98500, objectif: 100000 },
    { name: 'Fev', revenus: 87200, objectif: 100000 },
    { name: 'Mar', revenus: 105300, objectif: 100000 },
    { name: 'Avr', revenus: 92800, objectif: 100000 },
    { name: 'Mai', revenus: 110200, objectif: 100000 },
    { name: 'Jun', revenus: 95600, objectif: 100000 },
  ];

  const paymentDistribution = [
    { name: 'Payé', value: 75, color: '#28A745', amount: 956750 },
    { name: 'En attente', value: 20, color: '#FD7E14', amount: 255400 },
    { name: 'En retard', value: 5, color: '#DC3545', amount: 63850 },
  ];

  const feeTypes = [
    { name: 'Frais de scolarité', amount: 850000, percentage: 65 },
    { name: 'Frais d\'inscription', amount: 246000, percentage: 19 },
    { name: 'Frais de cantine', amount: 156000, percentage: 12 },
    { name: 'Activités extra-scolaires', amount: 54000, percentage: 4 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-success">Payé</Badge>;
      case 'pending':
        return <Badge className="bg-warning">En attente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>;
      case 'partial':
        return <Badge className="bg-secondary">Partiel</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check className="w-4 h-4 text-success" />;
      case 'pending':
        return <CreditCard className="w-4 h-4 text-warning" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'partial':
        return <TrendingUp className="w-4 h-4 text-secondary" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion financière</h1>
          <p className="text-muted-foreground mt-2">
            Suivi des paiements et des finances de l'établissement
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Exporter rapports
          </Button>
          <Button 
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={() => setFeeModal({ isOpen: true, mode: 'create', fee: null })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau frais
          </Button>
        </div>
      </div>

      {/* Indicateurs financiers principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus ce mois</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(87200)}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% vs mois dernier
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-3xl font-bold text-warning">{formatCurrency(255400)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  245 paiements en cours
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En retard</p>
                <p className="text-3xl font-bold text-destructive">{formatCurrency(63850)}</p>
                <p className="text-xs text-destructive flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  28 paiements en retard
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de recouvrement</p>
                <p className="text-3xl font-bold text-primary">75%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Objectif : 85%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des revenus */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
            <CardDescription>Revenus mensuels vs objectifs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialOverview}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenus" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  name="Revenus réels"
                />
                <Line 
                  type="monotone" 
                  dataKey="objectif" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Objectif"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des paiements */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>État des paiements</CardTitle>
            <CardDescription>Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {paymentDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Types de frais */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Répartition par type de frais</CardTitle>
          <CardDescription>Analyse des revenus par catégorie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeTypes.map((fee) => (
              <div key={fee.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{fee.name}</span>
                    <span className="font-bold text-lg">{formatCurrency(fee.amount)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fee.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{fee.percentage}% du total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des paiements */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Paiements récents</CardTitle>
              <CardDescription>
                {filteredPayments.length} paiements • Dernière mise à jour il y a 2 minutes
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Tous les statuts</option>
                <option value="paid">Payé</option>
                <option value="pending">En attente</option>
                <option value="overdue">En retard</option>
                <option value="partial">Partiel</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {payment.studentName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{payment.studentName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{payment.class}</span>
                      <span>•</span>
                      <span>{payment.feeType}</span>
                      <span>•</span>
                      <span>Échéance : {new Date(payment.dueDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {payment.status === 'partial' && payment.paidAmount
                        ? `${formatCurrency(payment.paidAmount)} / `
                        : ''
                      }
                      {formatCurrency(payment.amount)}
                    </p>
                    {payment.paidDate && (
                      <p className="text-xs text-muted-foreground">
                        Payé le {new Date(payment.paidDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    {getStatusBadge(payment.status)}
                  </div>

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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <FeeModal
        isOpen={feeModal.isOpen}
        onClose={() => setFeeModal({ isOpen: false, mode: 'create', fee: null })}
        onSave={(fee) => {
          toast({ title: "Frais créés", description: `Les frais ${fee.name} ont été créés avec succès.` });
          setFeeModal({ isOpen: false, mode: 'create', fee: null });
        }}
        fee={feeModal.fee}
        mode={feeModal.mode}
      />
    </div>
  );
};

export default Finances;