import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { School, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const schoolSchema = z.object({
  name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Email invalide' }).optional().or(z.literal('')),
  phone: z.string().min(8, { message: 'Numéro de téléphone invalide' }).optional().or(z.literal('')),
  website: z.string().url({ message: 'URL invalide' }).optional().or(z.literal('')),
  address: z.string().min(5, { message: 'L\'adresse doit contenir au moins 5 caractères' }).optional().or(z.literal('')),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

const CreateSchool: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
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
        // Remove website property since it doesn't exist in School type
        address: values.address || undefined,
      });
      
      toast({
        title: 'École créée',
        description: `L'école ${values.name} a été créée avec succès.`,
      });
      
      // Recharger les données utilisateur pour mettre à jour le contexte
      window.location.reload();
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'école:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer l\'école.',
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
                      <Textarea {...field} placeholder="Adresse complète de l'école" />
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
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Aller au tableau de bord
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateSchool;