import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { School, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

// Update the schema to include "bilingue" option
const schoolSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Email invalide' }).optional().or(z.literal('')),
  phone: z.string().min(8, { message: 'Numéro de téléphone invalide' }).optional().or(z.literal('')),
  website: z.string().url({ message: 'URL invalide' }).optional().or(z.literal('')),
  address: z.string().min(5, { message: 'L\'adresse doit contenir au moins 5 caractères' }).optional().or(z.literal('')),
  system_type: z.enum(['francophone', 'anglophone', 'bilingue']).default('francophone'),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

const CreateSchool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, switchSchool } = useAuth();

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      system_type: 'francophone',
    },
  });

  // Rediriger si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (values: SchoolFormValues) => {
    setIsLoading(true);
    
    try {
      // Créer l'école
      const response = await schoolService.createSchool({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        system_type: values.system_type,
      });
      
      // Extract the school data from the response
      const newSchool = response.school;
      
      // Switch to the newly created school
      await switchSchool(newSchool);
      
      toast({
        title: 'École créée',
        description: `L'école ${values.name} a été créée avec succès.`,
      });
      
      // Rediriger vers le tableau de bord
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'école:', error);
      
      let errorMessage = 'Impossible de créer l\'école.';
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

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <School className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Bienvenue ! Créez votre école
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Pour commencer à gérer vos élèves, créez d'abord votre école
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Seul le nom de l'école est obligatoire. Vous pourrez compléter les autres informations plus tard.
            </AlertDescription>
          </Alert>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Nom de l'école */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'école *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom de l'école" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="email@ecole.fr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Téléphone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+33 1 23 45 67 89" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Site web */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://www.ecole.fr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Adresse */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Adresse complète de l'école" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Système scolaire */}
              <FormField
                control={form.control}
                name="system_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Système scolaire</FormLabel>
                    <FormControl>
                      <select
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

              <div className="pt-4 flex flex-col space-y-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Création en cours...' : 'Créer l\'école'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button variant="ghost" asChild>
            <Link to="/select-school">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la sélection d'école
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateSchool;