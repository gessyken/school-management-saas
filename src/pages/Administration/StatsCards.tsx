import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Clock, Activity } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalMembers: number;
    activeMembers: number;
    pendingRequests: number;
    recentActivity: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total membres</p>
              <p className="text-3xl font-bold text-primary">{stats.totalMembers}</p>
            </div>
            <Users className="w-10 h-10 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Membres actifs</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
            </div>
            <UserCheck className="w-10 h-10 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Demandes en attente</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activité récente</p>
              <p className="text-3xl font-bold text-blue-600">{stats.recentActivity}</p>
            </div>
            <Activity className="w-10 h-10 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;