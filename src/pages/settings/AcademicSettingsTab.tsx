import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const AcademicSettingsTab: React.FC = () => {
  const [academicSettings, setAcademicSettings] = useState({
    currentYear: '2023-2024',
    termSystem: '3',
    gradeScale: '20',
    passingGrade: '10',
    attendanceRequired: true,
  });

  const handleAcademicSettingsChange = (field: string, value: string | boolean) => {
    setAcademicSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default AcademicSettingsTab;