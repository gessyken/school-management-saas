import React, { useState, useEffect } from 'react';
import { School, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { schoolService } from '@/services/schoolService';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface SchoolSettingsTabProps {
    hasNoSchool: boolean;
}

const SchoolSettingsTab: React.FC<SchoolSettingsTabProps> = ({
    hasNoSchool,
}) => {
    const { currentSchool, userSchools, switchSchool } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    //   const [hasNoSchool, setHasNoSchool] = useState(false);

    const [schoolSettings, setSchoolSettings] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        logo: '',
        system_type: 'francophone',

    });

    // Initialize form with current school data
    useEffect(() => {
        if (currentSchool) {
            setSchoolSettings({
                name: currentSchool.name || '',
                address: currentSchool.address || '',
                phone: currentSchool.phone || '',
                email: currentSchool.email || '',
                logo: currentSchool.logo || '',
                system_type: currentSchool.system_type || 'francophone',

            });
        }

        // Check if user has no school
        // if (!currentSchool) {
        //   setHasNoSchool(true);
        // }
    }, [currentSchool, userSchools]);

    const handleSchoolSettingsChange = (field: string, value: string) => {
        setSchoolSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveSchoolSettings = async () => {
        if (!currentSchool?.id) {
            toast({
                title: 'Erreur',
                description: 'Aucune école sélectionnée.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            // Update the school
            const updatedSchool = await schoolService.updateSchool(currentSchool.id, {
                name: schoolSettings.name,
                address: schoolSettings.address,
                phone: schoolSettings.phone,
                email: schoolSettings.email,
                system_type: schoolSettings.system_type,
            });

            // Switch to the updated school to refresh the context
            await switchSchool(updatedSchool);

            toast({
                title: 'Succès',
                description: 'Les informations de l\'école ont été mises à jour.',
            });
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour de l\'école:', error);

            let errorMessage = 'Impossible de mettre à jour l\'école.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNewSchool = () => {
        navigate('/create-school');
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // TODO: Implement logo upload functionality
            console.log('Logo selected:', file);
            // You would typically upload the file to your server here
            // and then update the school with the new logo URL
            toast({
                title: 'Logo sélectionné',
                description: 'Fonctionnalité d\'upload à implémenter.',
            });
        }
    };

    if (hasNoSchool) {
        return (
            <div className="space-y-6">
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <School className="w-5 h-5" />
                            <span>Gestion des écoles</span>
                        </CardTitle>
                        <CardDescription>
                            Vous n'avez pas encore créé d'école. Créez votre première école pour commencer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleCreateNewSchool}
                            className="flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Créer ma première école</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* School Management Header */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <School className="w-5 h-5" />
                            <span>Gestion des écoles</span>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCreateNewSchool}
                                className="flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nouvelle école</span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSaveSchoolSettings}
                                disabled={isLoading}
                                className="flex items-center space-x-2"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                            </Button>
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Modifiez les informations de votre école actuelle ou créez une nouvelle école
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* School Information Form */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <School className="w-5 h-5" />
                        <span>Informations de l'établissement</span>
                    </CardTitle>
                    <CardDescription>
                        Gérez les informations générales de votre école. Les modifications seront appliquées après sauvegarde.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="schoolName">Nom de l'établissement *</Label>
                            <Input
                                id="schoolName"
                                value={schoolSettings.name}
                                onChange={(e) => handleSchoolSettingsChange('name', e.target.value)}
                                placeholder="Nom de l'école"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="schoolEmail">Email principal</Label>
                            <Input
                                id="schoolEmail"
                                type="email"
                                value={schoolSettings.email}
                                onChange={(e) => handleSchoolSettingsChange('email', e.target.value)}
                                placeholder="email@ecole.fr"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="schoolPhone">Téléphone</Label>
                            <Input
                                id="schoolPhone"
                                value={schoolSettings.phone}
                                onChange={(e) => handleSchoolSettingsChange('phone', e.target.value)}
                                placeholder="+33 1 23 45 67 89"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="schoolAddress">Adresse complète</Label>
                            <Input
                                id="schoolAddress"
                                value={schoolSettings.address}
                                onChange={(e) => handleSchoolSettingsChange('address', e.target.value)}
                                placeholder="Adresse complète de l'école"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="systemType">Système scolaire</Label>
                            <Select
                                value={schoolSettings.system_type}
                                onValueChange={(value: "francophone" | "anglophone" | "bilingue") =>
                                    handleSchoolSettingsChange('system_type', value)
                                }
                            >
                                <SelectTrigger id="systemType" className="w-full">
                                    <SelectValue placeholder="Choisir le système scolaire" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="francophone">Francophone</SelectItem>
                                    <SelectItem value="anglophone">Anglophone</SelectItem>
                                    <SelectItem value="bilingue">Bilingue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Logo Upload Section */}
                    <div className="space-y-2">
                        <Label>Logo de l'établissement</Label>
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                {schoolSettings.name
                                    ? schoolSettings.name.split(' ').map(word => word[0]).join('').slice(0, 3)
                                    : 'ECO'
                                }
                            </div>
                            <div className="flex flex-col space-y-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="logo-upload"
                                    onChange={handleLogoUpload}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                >
                                    Changer le logo
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Format recommandé: PNG, JPG (max 2MB)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleSaveSchoolSettings}
                            disabled={isLoading || !schoolSettings.name.trim()}
                            className="min-w-32"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Sauvegarde...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Sauvegarder
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Current School Info */}
            {/* {currentSchool && (
                <Card className="shadow-card border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="text-green-700">École actuelle</CardTitle>
                        <CardDescription>
                            Vous modifiez actuellement les informations de cette école
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Nom:</span> {currentSchool.name}
                            </div>
                            <div>
                                <span className="font-medium">Email:</span> {currentSchool.email || 'Non renseigné'}
                            </div>
                            <div>
                                <span className="font-medium">Téléphone:</span> {currentSchool.phone || 'Non renseigné'}
                            </div>
                            <div>
                                <span className="font-medium">Adresse:</span> {currentSchool.address || 'Non renseignée'}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )} */}
        </div>
    );
};

export default SchoolSettingsTab;