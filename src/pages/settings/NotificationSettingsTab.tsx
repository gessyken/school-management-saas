import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const NotificationSettingsTab: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    parentNotifications: true,
    teacherNotifications: true,
    paymentReminders: true,
    gradeNotifications: true,
  });

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications et communications</span>
          </CardTitle>
          <CardDescription>
            Configurez les notifications automatiques du système
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des emails pour les événements importants
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des SMS pour les urgences et rappels
                </p>
              </div>
              <Switch
                checked={notificationSettings.smsNotifications}
                onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications aux parents</Label>
                <p className="text-sm text-muted-foreground">
                  Informer automatiquement les parents des résultats
                </p>
              </div>
              <Switch
                checked={notificationSettings.parentNotifications}
                onCheckedChange={(checked) => handleNotificationChange('parentNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications aux enseignants</Label>
                <p className="text-sm text-muted-foreground">
                  Alertes pour les enseignants sur les étudiants à risque
                </p>
              </div>
              <Switch
                checked={notificationSettings.teacherNotifications}
                onCheckedChange={(checked) => handleNotificationChange('teacherNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Rappels de paiement</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des rappels automatiques pour les frais impayés
                </p>
              </div>
              <Switch
                checked={notificationSettings.paymentReminders}
                onCheckedChange={(checked) => handleNotificationChange('paymentReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications de notes</Label>
                <p className="text-sm text-muted-foreground">
                  Informer lors de la publication de nouvelles notes
                </p>
              </div>
              <Switch
                checked={notificationSettings.gradeNotifications}
                onCheckedChange={(checked) => handleNotificationChange('gradeNotifications', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettingsTab;