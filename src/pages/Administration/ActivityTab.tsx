import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  action: string;
  details: string;
  timestamp: string;
  type: 'user_action' | 'system' | 'admin_action';
}

interface ActivityTabProps {
  activityLogs: ActivityLog[];
  isLoading: boolean;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ activityLogs, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal d'activité</CardTitle>
        <CardDescription>
          Historique des actions effectuées dans l'établissement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs.map((log) => (
            <div key={log._id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                log.type === 'admin_action' ? 'bg-red-500' : 
                log.type === 'system' ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{log.action}</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {log.user.firstName[0]}{log.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {log.user.firstName} {log.user.lastName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activityLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune activité récente</h3>
            <p className="text-muted-foreground">
              Aucune action n'a été enregistrée récemment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTab;