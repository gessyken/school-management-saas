import React, { useState, useEffect } from 'react';
import { School, Save, AlertCircle, Bell, Calendar, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { schoolService } from '@/services/schoolService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import SchoolSettingsTab from './settings/SchoolSettingsTab';
import AcademicSettingsTab from './settings/AcademicSettingsTab';
import NotificationSettingsTab from './settings/NotificationSettingsTab';

const Settings: React.FC = () => {
  const { currentSchool, userSchools } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasNoSchool, setHasNoSchool] = useState(false);
  const navigate = useNavigate();

  // School settings state
  const [schoolSettings, setSchoolSettings] = useState({
    name: currentSchool?.name || '',
    address: currentSchool?.address || '',
    phone: currentSchool?.phone || '',
    email: currentSchool?.email || '',
    logo: '',
  });

  // Vérifier si l'utilisateur n'a pas d'école
  useEffect(() => {
    if (!currentSchool) {
      setHasNoSchool(true);
    }
  }, [currentSchool, userSchools]);

  const handleSchoolSettingsChange = (field: string, value: string) => {
    setSchoolSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {hasNoSchool ? 'Créer votre école' : 'Paramètres système'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {hasNoSchool 
              ? 'Configurez votre nouvel établissement scolaire' 
              : 'Configuration de votre établissement scolaire'}
          </p>
        </div>
      </div>
      
      {hasNoSchool && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Vous n'avez pas encore d'école</AlertTitle>
          <AlertDescription className="text-amber-700">
            Veuillez créer votre établissement scolaire en remplissant le formulaire ci-dessous.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="school" className="w-full">
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
        <TabsContent value="school">
          <SchoolSettingsTab
            hasNoSchool={hasNoSchool}
          />
        </TabsContent>

        {/* Paramètres académiques */}
        <TabsContent value="academic">
          <AcademicSettingsTab />
        </TabsContent>

        {/* Paramètres de notifications */}
        <TabsContent value="notifications">
          <NotificationSettingsTab />
        </TabsContent>

        {/* Paramètres système */}
        <TabsContent value="system">
          {/* <SystemSettingsTab /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;