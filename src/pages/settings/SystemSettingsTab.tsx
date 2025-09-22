import React, { useState } from 'react';
import { Database, Shield, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const SystemSettingsTab: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '5',
    maintenanceMode: false,
  });

  const handleSystemChange = (field: string, value: string | boolean) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Configuration système</span>
          </CardTitle>
          <CardDescription>
            Paramètres de sécurité et de maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Sauvegarder automatiquement les données
                </p>
              </div>
              <Switch
                checked={systemSettings.autoBackup}
                onCheckedChange={(checked) => handleSystemChange('autoBackup', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
              <select
                id="backupFrequency"
                value={systemSettings.backupFrequency}
                onChange={(e) => handleSystemChange('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={!systemSettings.autoBackup}
              >
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataRetention">Durée de conservation (années)</Label>
              <Input
                id="dataRetention"
                value={systemSettings.dataRetention}
                onChange={(e) => handleSystemChange('dataRetention', e.target.value)}
                type="number"
                min="1"
                max="10"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mode maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le mode maintenance pour les mises à jour
                </p>
              </div>
              <Switch
                checked={systemSettings.maintenanceMode}
                onCheckedChange={(checked) => handleSystemChange('maintenanceMode', checked)}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Actions système
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Database className="w-6 h-6" />
                <span>Sauvegarde manuelle</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="w-6 h-6" />
                <span>Exporter données</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 text-destructive hover:text-destructive">
                <Shield className="w-6 h-6" />
                <span>Reset système</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsTab;