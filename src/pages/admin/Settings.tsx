import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  School, 
  Calendar, 
  Globe, 
  Save, 
  AlertTriangle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { subjectsService } from '@/services/subjectsService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SchoolSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  academicYear: string;
  educationSystems: string[];
  currency: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SchoolSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    academicYear: '2024-2025',
    educationSystems: ['francophone', 'anglophone'],
    currency: 'FCFA',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement real API call to get school settings
      // For now, use placeholder data
      setSettings({
        name: (user as any)?.school?.name || 'Mon École',
        address: '123 Rue de l\'École, Yaoundé, Cameroun',
        phone: '+237 6XX XXX XXX',
        email: 'contact@monecole.cm',
        website: 'https://monecole.cm',
        logo: '',
        academicYear: '2024-2025',
        educationSystems: ['francophone', 'anglophone'],
        currency: 'FCFA',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement real API call to save school settings
      // await api.put('/school/settings', settings);
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres de l'école ont été mis à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurgeSubjects = async () => {
    try {
      await subjectsService.purgeSubjects();
      toast({
        title: "Matières supprimées",
        description: "Toutes les matières ont été supprimées de la base de données.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les matières.",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field: keyof SchoolSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Configuration de l'établissement et du système
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5" />
              Informations de l'école
            </CardTitle>
            <CardDescription>
              Détails généraux de l'établissement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'école *</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nom de l'établissement"
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Adresse complète"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contact@ecole.cm"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://monecole.cm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Paramètres académiques
            </CardTitle>
            <CardDescription>
              Configuration de l'année scolaire et des systèmes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="academicYear">Année académique</Label>
              <Input
                id="academicYear"
                value={settings.academicYear}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                placeholder="2024-2025"
              />
            </div>
            <div>
              <Label>Systèmes éducatifs</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {settings.educationSystems.map((system) => (
                  <Badge key={system} variant="secondary">
                    {system === 'francophone' ? 'Francophone' : 'Anglophone'}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Systèmes éducatifs supportés par l'établissement
              </p>
            </div>
            <div>
              <Label htmlFor="currency">Devise</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder="FCFA"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              État du système
            </CardTitle>
            <CardDescription>
              Informations sur le système et la base de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de données</span>
              <Badge variant="default">Connectée</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentification</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Version</span>
              <Badge variant="outline">v1.0.0</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Dernière sauvegarde</span>
              <span className="text-xs text-muted-foreground">
                Jamais
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Zone dangereuse
            </CardTitle>
            <CardDescription>
              Actions irréversibles - utilisez avec précaution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <h4 className="font-medium mb-2">Supprimer toutes les matières</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Cette action supprimera définitivement toutes les matières de la base de données.
                Les références dans les classes seront également supprimées.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vider les matières
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera définitivement
                      toutes les matières de votre école et supprimera leurs données de nos serveurs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handlePurgeSubjects}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Oui, supprimer toutes les matières
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
