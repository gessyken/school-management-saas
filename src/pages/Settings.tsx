import React, { useState } from 'react';
import { Save, School, Users, Calendar, Bell, Shield, Database, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

const Settings: React.FC = () => {
  const { currentSchool } = useAuth();
  const [schoolSettings, setSchoolSettings] = useState({
    name: currentSchool?.name || '',
    address: '123 Rue de l\'École, 75001 Paris',
    phone: '01 23 45 67 89',
    email: 'contact@ecole-saintmichel.fr',
    website: 'www.ecole-saintmichel.fr',
    logo: '',
  });

  const [academicSettings, setAcademicSettings] = useState({
    currentYear: '2023-2024',
    termSystem: '3', // 3 trimestres
    gradeScale: '20',
    passingGrade: '10',
    attendanceRequired: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    parentNotifications: true,
    teacherNotifications: true,
    paymentReminders: true,
    gradeNotifications: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '5', // années
    maintenanceMode: false,
  });

  const handleSchoolSettingsChange = (field: string, value: string) => {
    setSchoolSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAcademicSettingsChange = (field: string, value: string | boolean) => {
    setAcademicSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSystemChange = (field: string, value: string | boolean) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = () => {
    console.log('Saving settings...', {
      school: schoolSettings,
      academic: academicSettings,
      notifications: notificationSettings,
      system: systemSettings,
    });
    // Ici, on ferait un appel API pour sauvegarder
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres système</h1>
          <p className="text-muted-foreground mt-2">
            Configuration de votre établissement scolaire
          </p>
        </div>
        <Button onClick={saveSettings} className="bg-gradient-primary hover:bg-primary-hover">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder les modifications
        </Button>
      </div>

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="school" className="flex items-center space-x-2">
            <School className="w-4 h-4" />
            <span>École</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Académique</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Système</span>
          </TabsTrigger>
        </TabsList>

        {/* Paramètres de l'école */}
        <TabsContent value="school" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <School className="w-5 h-5" />
                <span>Informations de l'établissement</span>
              </CardTitle>
              <CardDescription>
                Gérez les informations générales de votre école
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nom de l'établissement</Label>
                  <Input
                    id="schoolName"
                    value={schoolSettings.name}
                    onChange={(e) => handleSchoolSettingsChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">Email principal</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={schoolSettings.email}
                    onChange={(e) => handleSchoolSettingsChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Téléphone</Label>
                  <Input
                    id="schoolPhone"
                    value={schoolSettings.phone}
                    onChange={(e) => handleSchoolSettingsChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolWebsite">Site web</Label>
                  <Input
                    id="schoolWebsite"
                    value={schoolSettings.website}
                    onChange={(e) => handleSchoolSettingsChange('website', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolAddress">Adresse complète</Label>
                <Input
                  id="schoolAddress"
                  value={schoolSettings.address}
                  onChange={(e) => handleSchoolSettingsChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Logo de l'établissement</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold">
                    {schoolSettings.name.split(' ').map(word => word[0]).join('').slice(0, 3)}
                  </div>
                  <Button variant="outline">
                    Changer le logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres académiques */}
        <TabsContent value="academic" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Configuration académique</span>
              </CardTitle>
              <CardDescription>
                Définissez les paramètres pédagogiques de votre établissement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentYear">Année académique actuelle</Label>
                  <Input
                    id="currentYear"
                    value={academicSettings.currentYear}
                    onChange={(e) => handleAcademicSettingsChange('currentYear', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termSystem">Système de périodes</Label>
                  <select
                    id="termSystem"
                    value={academicSettings.termSystem}
                    onChange={(e) => handleAcademicSettingsChange('termSystem', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="3">3 Trimestres</option>
                    <option value="2">2 Semestres</option>
                    <option value="4">4 Périodes</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradeScale">Échelle de notation</Label>
                  <select
                    id="gradeScale"
                    value={academicSettings.gradeScale}
                    onChange={(e) => handleAcademicSettingsChange('gradeScale', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="20">Sur 20 points</option>
                    <option value="100">Sur 100 points</option>
                    <option value="letter">Lettres (A-F)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingGrade">Note minimale de passage</Label>
                  <Input
                    id="passingGrade"
                    value={academicSettings.passingGrade}
                    onChange={(e) => handleAcademicSettingsChange('passingGrade', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={academicSettings.attendanceRequired}
                  onCheckedChange={(checked) => handleAcademicSettingsChange('attendanceRequired', checked)}
                />
                <div>
                  <Label>Suivi d'assiduité obligatoire</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger le suivi de présence pour valider les notes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres de notifications */}
        <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent>

        {/* Paramètres système */}
        <TabsContent value="system" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;