import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { School, ArrowLeft, AlertCircle, Upload, Trash2, Sparkles, Building2, Mail, Phone, MapPin, BookOpen, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { schoolService } from '@/services/schoolService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Updated schema to match backend model
const schoolSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Email invalide' }).optional().or(z.literal('')),
  phone: z.string().min(8, { message: 'Numéro de téléphone invalide' }).optional().or(z.literal('')),
  address: z.string().min(5, { message: 'L\'adresse doit contenir au moins 5 caractères' }).optional().or(z.literal('')),
  motto: z.string().optional(),
  type: z.string().optional(),
  system_type: z.enum(['francophone', 'anglophone', 'bilingue']).default('francophone'),
  plan: z.enum(['FREE', 'BASIC', 'PRO']).default('FREE'),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

const CreateSchool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const { isAuthenticated, switchSchool } = useAuth();

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      motto: '',
      type: '',
      system_type: 'francophone',
      plan: 'FREE',
    },
  });

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
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Rediriger si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (values: SchoolFormValues) => {
    setIsLoading(true);

    try {
      // Prepare form data for file upload
      const formData = new FormData();

      // Append all form fields
      Object.keys(values).forEach(key => {
        const value = values[key as keyof SchoolFormValues];
        if (value !== undefined && value !== '') {
          formData.append(key, value as string);
        }
      });

      // Append logo file if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Create school with form data
      const response = await schoolService.createSchool(formData);

      // Extract the school data from the response
      const newSchool = response.school;

      // Switch to the newly created school
      await switchSchool(newSchool);

      toast({
        title: 'École créée avec succès',
        description: `L'école "${values.name}" a été créée et vous êtes maintenant administrateur.`,
      });

      // Rediriger vers le tableau de bord
      window.location.href = '/dashboard';

    } catch (error: any) {
      console.error('Erreur lors de la création de l\'école:', error);

      let errorMessage = 'Impossible de créer l\'école. Veuillez réessayer.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toast({
        title: 'Erreur de création',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-lg mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Créer votre école
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Configurez votre établissement et commencez à gérer votre communauté éducative
          </p>
        </div>

        <Card className="w-full shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Sidebar */}
            <div className="lg:col-span-1 bg-gradient-to-b from-blue-600 to-indigo-700 text-white p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Nouvelle École</h2>
                  <p className="text-blue-100 opacity-90">
                    Remplissez les informations de base pour créer votre établissement
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-500/20 rounded-xl">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Informations générales</p>
                      <p className="text-blue-100 text-sm">Nom, type et devise</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Coordonnées</p>
                      <p className="text-blue-100 text-sm">Email, téléphone, adresse</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Configuration</p>
                      <p className="text-blue-100 text-sm">Système et forfait</p>
                    </div>
                  </div>
                </div>

                <Alert className="bg-white/10 border-white/20 mt-8">
                  <AlertCircle className="h-4 w-4 text-blue-200" />
                  <AlertDescription className="text-blue-100 text-sm">
                    Seul le nom de l'école est obligatoire. Période d'essai de 30 jours incluse.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-2 p-8">
              <CardContent className="p-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Logo Section */}
                    <div className="text-center mb-8">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          {logoPreview ? (
                            <div className="relative">
                              <img
                                src={logoPreview}
                                alt="Aperçu du logo"
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
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
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                              <School className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="logo"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {logoFile ? 'Changer le logo' : 'Ajouter un logo'}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, JPEG - max. 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-5">
                        {/* School Name */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center text-sm font-semibold">
                                <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                                Nom de l'école *
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Ex: Lycée Jean Moulin" 
                                  className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* School Type */}
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center text-sm font-semibold">
                                <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                                Type d'établissement
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Ex: Lycée, Collège, École primaire" 
                                  className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Motto */}
                        <FormField
                          control={form.control}
                          name="motto"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">Devise</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="La devise de votre établissement" 
                                  className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Right Column */}
                      <div className="space-y-5">
                        {/* Email */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center text-sm font-semibold">
                                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email" 
                                  placeholder="contact@ecole.fr" 
                                  className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Phone */}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center text-sm font-semibold">
                                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                Téléphone
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="+33 1 23 45 67 89" 
                                  className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Address */}
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center text-sm font-semibold">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                Adresse
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Adresse complète de l'école" 
                                  className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* System Type */}
                        <FormField
                          control={form.control}
                          name="system_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">Système scolaire</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full h-12 px-3 border border-gray-200 rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  {...field}
                                >
                                  <option value="francophone">Francophone</option>
                                  <option value="anglophone">Anglophone</option>
                                  <option value="bilingue">Bilingue</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Plan */}
                        <FormField
                          control={form.control}
                          name="plan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">Forfait</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full h-12 px-3 border border-gray-200 rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  {...field}
                                >
                                  <option value="FREE">Gratuit (30 jours d'essai)</option>
                                  <option value="BASIC">Basique</option>
                                  <option value="PRO">Professionnel</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                        size="lg"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Création en cours...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Créer l'école et commencer
                          </div>
                        )}
                      </Button>

                      <p className="text-xs text-center text-gray-500 mt-3">
                        En créant cette école, vous acceptez nos conditions d'utilisation et devenez l'administrateur principal.
                      </p>
                    </div>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="flex justify-center border-t pt-6 mt-6">
                <Button variant="ghost" asChild className="rounded-lg">
                  <Link to="/select-school" className="flex items-center text-gray-600 hover:text-gray-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la sélection d'école
                  </Link>
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateSchool;