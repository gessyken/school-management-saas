import React, { useState, useEffect } from 'react';
import { School, Plus, Save, Upload, Trash2, Building2, Mail, Phone, MapPin, Globe, Sparkles, Users, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { schoolService } from '@/services/schoolService';
import { Member, memberService } from '@/services/memberService'; // Add this import
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { baseURL } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SchoolSettingsTabProps {
    hasNoSchool: boolean;
}

const SchoolSettingsTab: React.FC<SchoolSettingsTabProps> = ({
    hasNoSchool,
}) => {
    const { currentSchool, userSchools, switchSchool, user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);

    const [selectedPrincipal, setSelectedPrincipal] = useState<string>('');

    const [schoolSettings, setSchoolSettings] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        motto: '',
        type: '',
        system_type: 'francophone' as 'francophone' | 'anglophone' | 'bilingue',
    });

    // Initialize form with current school data
    useEffect(() => {
        if (currentSchool) {
            setSchoolSettings({
                name: currentSchool.name || '',
                address: currentSchool.address || '',
                phone: currentSchool.phone || '',
                email: currentSchool.email || '',
                motto: currentSchool.motto || '',
                type: currentSchool.type || '',
                system_type: currentSchool.system_type || 'francophone',
            });

            // Set logo preview if exists
            if (currentSchool.logoUrl) {
                setLogoPreview(currentSchool.logoUrl);
            }

            // Set current principal
            if (currentSchool.principal) {
                setSelectedPrincipal(currentSchool.principal._id || currentSchool.principal);
            }

            // Load members
            loadMembers();
        }
    }, [currentSchool]);

    // Load school members
    const loadMembers = async () => {
        console.log("currentSchool?.id", currentSchool?.id)
        console.log("currentSchool?._id", currentSchool?._id)
        if (!currentSchool?._id) return;

        setIsLoadingMembers(true);
        try {
            const membersData = await memberService.getSchoolMembers(currentSchool._id);
            console.log("membersData", membersData)
            setMembers(membersData);
        } catch (error) {
            console.error('Error loading members:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger la liste des membres.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleSchoolSettingsChange = (field: string, value: string) => {
        setSchoolSettings(prev => ({ ...prev, [field]: value }));
    };

    // Handle logo file selection
    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Erreur',
                    description: 'Veuillez sélectionner un fichier image valide.',
                    variant: 'destructive',
                });
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'Erreur',
                    description: 'L\'image ne doit pas dépasser 5MB.',
                    variant: 'destructive',
                });
                return;
            }

            setLogoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected logo
    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview('');
        const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSaveSchoolSettings = async () => {
        if (!currentSchool?._id) {
            toast({
                title: 'Erreur',
                description: 'Aucune école sélectionnée.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            // Prepare form data for file upload
            const formData = new FormData();

            // Append all form fields
            Object.keys(schoolSettings).forEach(key => {
                const value = schoolSettings[key as keyof typeof schoolSettings];
                if (value !== undefined && value !== '') {
                    formData.append(key, value as string);
                }
            });

            // Append principal if changed
            if (selectedPrincipal && selectedPrincipal !== currentSchool.principal?._id) {
                formData.append('principal', selectedPrincipal);
            }

            // Append logo file if selected
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            // Update the school
            const updatedSchool = await schoolService.updateSchool(currentSchool._id, formData);
            console.log("updatedSchool",updatedSchool)
            // Switch to the updated school to refresh the context
            await switchSchool(updatedSchool);

            // Reset logo file state
            setLogoFile(null);

            toast({
                title: 'Succès',
                description: 'Les informations de l\'école ont été mises à jour.',
            });
        } catch (error: any) {
            console.error('Erreur lors de la mise à jour de l\'école:', error);

            let errorMessage = 'Impossible de mettre à jour l\'école.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
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

    const handleLogoUpload = async () => {
        if (!logoFile || !currentSchool?._id) return;

        setIsUploadingLogo(true);
        try {
            const formData = new FormData();
            console.log('logo', logoFile);
            formData.append('logo', logoFile);

            const updatedSchool = await schoolService.updateSchoolLogo(currentSchool?._id, formData);
            await switchSchool(currentSchool);

            setLogoFile(null);

            toast({
                title: 'Succès',
                description: 'Logo mis à jour avec succès.',
            });
        } catch (error: any) {
            console.error('Erreur lors de l\'upload du logo:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de mettre à jour le logo.',
                variant: 'destructive',
            });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    // Handle principal change
    const handlePrincipalChange = (memberId: string) => {
        setSelectedPrincipal(memberId);
    };

    // Get user initials for avatar
    const getUserInitials = (name: string) => {
        return name
            ?.split(' ')
            ?.map(part => part[0])
            ?.join('')
            ?.toUpperCase()
            ?.slice(0, 2);
    };

    if (hasNoSchool) {
        return (
            <div className="space-y-6">
                <Card className="shadow-card border-0 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <School className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Gestion des écoles</h2>
                                <p className="text-blue-100">
                                    Créez votre première école pour commencer à utiliser la plateforme
                                </p>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                                <School className="w-10 h-10 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Aucune école créée
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Vous n'avez pas encore créé d'école. Créez votre première école pour commencer à gérer vos élèves et votre personnel.
                                </p>
                            </div>
                            <Button
                                onClick={handleCreateNewSchool}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold"
                                size="lg"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Créer ma première école
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="shadow-card border-0 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <School className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Gestion des écoles</h2>
                                <p className="text-blue-100">
                                    Modifiez les informations de votre école ou créez un nouvel établissement
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCreateNewSchool}
                                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nouvelle école
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* School Information Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo Section */}
                <Card className="lg:col-span-1 shadow-card border-0 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <span>Logo de l'école</span>
                        </CardTitle>
                        <CardDescription>
                            Personnalisez l'identité visuelle de votre établissement
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                {logoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={!logoPreview.startsWith('/upload') ? logoPreview :
                                                `${baseURL}/../document${logoPreview}`}
                                            alt="Logo de l'école"
                                            className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 shadow-lg transition-all"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                                        <School className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center space-y-3">
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all cursor-pointer"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {logoPreview ? 'Changer le logo' : 'Ajouter un logo'}
                                </label>

                                {logoFile && (
                                    <Button
                                        onClick={handleLogoUpload}
                                        disabled={isUploadingLogo}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isUploadingLogo ? 'Upload...' : 'Sauvegarder le logo'}
                                    </Button>
                                )}

                                <p className="text-xs text-gray-500">
                                    PNG, JPG, JPEG - max. 5MB
                                </p>
                            </div>
                        </div>

                        {/* Current School Info */}
                        {currentSchool && (
                            <div className="pt-4 border-t space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Plan actuel:</span>
                                    <Badge
                                        variant={
                                            currentSchool.plan === 'PRO' ? 'default' :
                                                currentSchool.plan === 'BASIC' ? 'secondary' : 'outline'
                                        }
                                    >
                                        {currentSchool.plan}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Statut:</span>
                                    <Badge
                                        variant={
                                            currentSchool.accessStatus === 'active' ? 'default' :
                                                currentSchool.accessStatus === 'suspended' ? 'secondary' : 'destructive'
                                        }
                                    >
                                        {currentSchool.accessStatus}
                                    </Badge>
                                </div>
                                {currentSchool.motto && (
                                    <div className="text-center pt-3">
                                        <p className="text-sm text-gray-600 italic">"{currentSchool.motto}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* School Details Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-card border-0 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <span>Informations de l'établissement</span>
                            </CardTitle>
                            <CardDescription>
                                Modifiez les informations générales de votre école
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* School Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="schoolName" className="flex items-center text-sm font-semibold">
                                        <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                                        Nom de l'établissement *
                                    </Label>
                                    <Input
                                        id="schoolName"
                                        value={schoolSettings.name}
                                        onChange={(e) => handleSchoolSettingsChange('name', e.target.value)}
                                        placeholder="Nom de l'école"
                                        className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* School Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="schoolType" className="flex items-center text-sm font-semibold">
                                        <Globe className="w-4 h-4 mr-2 text-blue-600" />
                                        Type d'établissement
                                    </Label>
                                    <Input
                                        id="schoolType"
                                        value={schoolSettings.type}
                                        onChange={(e) => handleSchoolSettingsChange('type', e.target.value)}
                                        placeholder="Ex: Lycée, Collège, École primaire"
                                        className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="schoolEmail" className="flex items-center text-sm font-semibold">
                                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                        Email principal
                                    </Label>
                                    <Input
                                        id="schoolEmail"
                                        type="email"
                                        value={schoolSettings.email}
                                        onChange={(e) => handleSchoolSettingsChange('email', e.target.value)}
                                        placeholder="email@ecole.fr"
                                        className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="schoolPhone" className="flex items-center text-sm font-semibold">
                                        <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                        Téléphone
                                    </Label>
                                    <Input
                                        id="schoolPhone"
                                        value={schoolSettings.phone}
                                        onChange={(e) => handleSchoolSettingsChange('phone', e.target.value)}
                                        placeholder="+33 1 23 45 67 89"
                                        className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Motto */}
                                <div className="space-y-2">
                                    <Label htmlFor="schoolMotto" className="text-sm font-semibold">
                                        Devise
                                    </Label>
                                    <Input
                                        id="schoolMotto"
                                        value={schoolSettings.motto}
                                        onChange={(e) => handleSchoolSettingsChange('motto', e.target.value)}
                                        placeholder="La devise de votre établissement"
                                        className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                {/* System Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="systemType" className="text-sm font-semibold">
                                        Système scolaire
                                    </Label>
                                    <Select
                                        value={schoolSettings.system_type}
                                        onValueChange={(value: "francophone" | "anglophone" | "bilingue") =>
                                            handleSchoolSettingsChange('system_type', value)
                                        }
                                    >
                                        <SelectTrigger id="systemType" className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="schoolAddress" className="flex items-center text-sm font-semibold">
                                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                    Adresse complète
                                </Label>
                                <Input
                                    id="schoolAddress"
                                    value={schoolSettings.address}
                                    onChange={(e) => handleSchoolSettingsChange('address', e.target.value)}
                                    placeholder="Adresse complète de l'école"
                                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {/* Principal Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="principal" className="flex items-center text-sm font-semibold">
                                    <Crown className="w-4 h-4 mr-2 text-yellow-600" />
                                    Directeur/Principal
                                </Label>
                                <Select
                                    value={selectedPrincipal}
                                    onValueChange={handlePrincipalChange}
                                >
                                    <SelectTrigger id="principal" className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Sélectionner le directeur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingMembers ? (
                                            <SelectItem value="loading" disabled>
                                                Chargement des membres...
                                            </SelectItem>
                                        ) : members.length === 0 ? (
                                            <SelectItem value="no-members" disabled>
                                                Aucun membre disponible
                                            </SelectItem>
                                        ) : (
                                            members.map((member) => (
                                                <SelectItem key={member._id} value={member._id}>
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="w-6 h-6">
                                                            {/* <AvatarImage src={member?.avatar} /> */}
                                                            <AvatarFallback className="text-xs">
                                                                {getUserInitials(member?.fullName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{member?.fullName}</span>
                                                        {member?.memberships?.find(m => m?.school === currentSchool?._id)?.roles.includes('ADMIN') && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Admin
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">
                                    Sélectionnez le directeur principal de l'établissement
                                </p>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSaveSchoolSettings}
                                    disabled={isLoading || !schoolSettings.name.trim()}
                                    className="min-w-32 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Sauvegarder les modifications
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Members List */}
                    <Card className="shadow-card border-0 rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span>Membres de l'école ({members.length})</span>
                            </CardTitle>
                            <CardDescription>
                                Liste des membres ayant accès à cette école
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingMembers ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Chargement des membres...</p>
                                </div>
                            ) : members.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Aucun membre dans cette école</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {members.map((member) => (
                                        <div
                                            key={member._id}
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarImage src={member.avatar} />
                                                    <AvatarFallback>
                                                        {getUserInitials(member?.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member?.fullName}</p>
                                                    <p className="text-sm text-gray-500">{member?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {/* {member.roles.map(role => ( */}
                                                {member?.memberships?.find(m => m?.school === currentSchool?._id)?.roles.map(role => (
                                                    <Badge key={role} variant="secondary" className="text-xs">
                                                        {role}
                                                    </Badge>
                                                ))}
                                                {selectedPrincipal === member._id && (
                                                    <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                        <Crown className="w-3 h-3 mr-1" />
                                                        Principal
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SchoolSettingsTab;