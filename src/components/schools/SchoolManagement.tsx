import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { usePagination } from '@/hooks/use-pagination';
import { useFormValidation } from '@/hooks/use-form-validation';
import { useCameroonLocations } from '@/hooks/use-cameroon-locations';
import { schoolService } from '@/services/schoolService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Plus, Edit, Trash2, Users } from 'lucide-react';
import { School } from '@/types';

interface SchoolManagementProps {
  language?: 'fr' | 'en';
}

export function SchoolManagement({ language = 'fr' }: SchoolManagementProps) {
  // État pour les écoles
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination pour les écoles
  const { 
    page, 
    perPage, 
    total, 
    updatePaginatedData, 
    goToPage, 
    changeItemsPerPage, 
    getPaginationParams 
  } = usePagination<School>();

  // Hook pour les régions et départements du Cameroun
  const { 
    regions, 
    departments, 
    selectedRegion, 
    selectedDepartmentId,
    selectRegionById, 
    selectDepartmentById 
  } = useCameroonLocations(language);

  // Validation du formulaire
  const initialFormState = {
    name: '',
    code: '',
    address: '',
    city: '',
    regionId: '',
    departmentId: '',
    phone: '',
    email: '',
    website: '',
    principalName: '',
    schoolSystem: 'fr', // 'fr' pour francophone, 'en' pour anglophone
    isActive: true
  };

  const validationRules = {
    name: { required: true, minLength: 3 },
    code: { required: true, minLength: 2, maxLength: 10 },
    address: { required: true },
    city: { required: true },
    regionId: { required: true },
    departmentId: { required: true },
    phone: { required: true, pattern: /^\+?[0-9]{9,15}$/ },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    principalName: { required: true },
    schoolSystem: { required: true }
  };

  const {
    formData,
    errors,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFormValues
  } = useFormValidation(initialFormState, validationRules);

  // Appels API
  const { execute: fetchSchools, isLoading: isLoadingSchools } = useApi({
    apiCall: (params: any) => schoolService.getSchools(params),
    onSuccess: (data) => {
      updatePaginatedData(data.schools, data.total);
      setSchools(data.schools);
    },
  });

  const { execute: createSchool, isLoading: isCreatingSchool } = useApi({
    apiCall: (schoolData: any) => schoolService.createSchool(schoolData),
    onSuccess: () => {
      setIsDialogOpen(false);
      resetForm();
      fetchSchools(getPaginationParams());
    },
    successMessage: language === 'fr' ? 'École créée avec succès' : 'School created successfully',
  });

  const { execute: updateSchool, isLoading: isUpdatingSchool } = useApi({
    apiCall: (schoolData: any) => schoolService.updateSchool(selectedSchool?.id as string, schoolData),
    onSuccess: () => {
      setIsDialogOpen(false);
      resetForm();
      fetchSchools(getPaginationParams());
    },
    successMessage: language === 'fr' ? 'École mise à jour avec succès' : 'School updated successfully',
  });

  const { execute: deleteSchool, isLoading: isDeletingSchool } = useApi({
    apiCall: (schoolId: string) => schoolService.deleteSchool(schoolId),
    onSuccess: () => {
      fetchSchools(getPaginationParams());
    },
    successMessage: language === 'fr' ? 'École supprimée avec succès' : 'School deleted successfully',
  });

  // Charger les données initiales
  useEffect(() => {
    fetchSchools(getPaginationParams());
  }, []);

  // Mettre à jour les écoles lors du changement de page ou de recherche
  useEffect(() => {
    fetchSchools({
      ...getPaginationParams(),
      search: searchQuery
    });
  }, [page, perPage, searchQuery]);

  // Mettre à jour les départements lorsque la région change
  useEffect(() => {
    if (formData.regionId) {
      selectRegionById(formData.regionId);
      // Réinitialiser le département si la région change
      if (formData.departmentId) {
        const departmentBelongsToRegion = departments.some(
          (dept) => dept.id === formData.departmentId && dept.regionId === formData.regionId
        );
        
        if (!departmentBelongsToRegion) {
          handleChange({ target: { name: 'departmentId', value: '' } } as any);
        }
      }
    }
  }, [formData.regionId, departments]);

  // Ouvrir le dialogue pour créer une école
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    resetForm();
    setSelectedSchool(null);
    setIsDialogOpen(true);
  };

  // Ouvrir le dialogue pour éditer une école
  const handleOpenEditDialog = (school: School) => {
    setDialogMode('edit');
    setSelectedSchool(school);
    
    // Sélectionner la région pour charger les départements correspondants
    if (school.region) {
      selectRegionById(school.region.id.toString());
    }
    
    setFormValues({
      name: school.name,
      code: school.code,
      address: school.address,
      city: school.city,
      regionId: school.region ? school.region.id.toString() : '',
      departmentId: school.department ? school.department.id.toString() : '',
      phone: school.phone,
      email: school.email,
      website: school.website || '',
      principalName: school.principalName,
      schoolSystem: school.schoolSystem,
      isActive: school.isActive
    });
    
    setIsDialogOpen(true);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const schoolData = {
        name: formData.name,
        code: formData.code,
        address: formData.address,
        city: formData.city,
        regionId: formData.regionId,
        departmentId: formData.departmentId,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        principalName: formData.principalName,
        schoolSystem: formData.schoolSystem,
        isActive: formData.isActive
      };

      if (dialogMode === 'create') {
        createSchool(schoolData);
      } else {
        updateSchool(schoolData);
      }
    }
  };

  // Gérer la suppression d'une école
  const handleDeleteSchool = (schoolId: string) => {
    if (window.confirm(language === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cette école ?' : 'Are you sure you want to delete this school?')) {
      deleteSchool(schoolId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'fr' ? 'Gestion des Écoles' : 'School Management'}
        </h2>
        
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {language === 'fr' ? 'Nouvelle École' : 'New School'}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'fr' ? 'Nom' : 'Name'}</TableHead>
                <TableHead>{language === 'fr' ? 'Code' : 'Code'}</TableHead>
                <TableHead>{language === 'fr' ? 'Ville' : 'City'}</TableHead>
                <TableHead>{language === 'fr' ? 'Système' : 'System'}</TableHead>
                <TableHead>{language === 'fr' ? 'Contact' : 'Contact'}</TableHead>
                <TableHead>{language === 'fr' ? 'Statut' : 'Status'}</TableHead>
                <TableHead className="text-right">{language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingSchools ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : schools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    {language === 'fr' ? 'Aucune école trouvée' : 'No schools found'}
                  </TableCell>
                </TableRow>
              ) : (
                schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                      <div className="font-medium">{school.name}</div>
                    </TableCell>
                    <TableCell>{school.code}</TableCell>
                    <TableCell>{school.city}</TableCell>
                    <TableCell>
                      <Badge className={school.schoolSystem === 'fr' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {school.schoolSystem === 'fr' 
                          ? (language === 'fr' ? 'Francophone' : 'French')
                          : (language === 'fr' ? 'Anglophone' : 'English')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{school.phone}</div>
                      <div className="text-xs text-muted-foreground">{school.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={school.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {school.isActive 
                          ? (language === 'fr' ? 'Active' : 'Active')
                          : (language === 'fr' ? 'Inactive' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(school)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteSchool(school.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/schools/${school.id}/users`}>
                          <Users className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            {language === 'fr'
              ? `Affichage de ${schools.length} sur ${total} écoles`
              : `Showing ${schools.length} of ${total} schools`}
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => goToPage(page - 1)} 
                  disabled={page === 1} 
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, Math.ceil(total / perPage)) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink 
                      isActive={pageNumber === page}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {Math.ceil(total / perPage) > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => goToPage(page + 1)} 
                  disabled={page === Math.ceil(total / perPage)} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <Select
            value={perPage.toString()}
            onValueChange={(value) => changeItemsPerPage(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? (language === 'fr' ? 'Créer une nouvelle école' : 'Create new school')
                : (language === 'fr' ? 'Modifier l\'école' : 'Edit school')}
            </DialogTitle>
            <DialogDescription>
              {language === 'fr'
                ? 'Remplissez les informations ci-dessous pour créer ou modifier une école.'
                : 'Fill in the information below to create or edit a school.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {language === 'fr' ? 'Nom de l\'école' : 'School Name'} *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs">{errors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">
                    {language === 'fr' ? 'Code' : 'Code'} *
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.code ? 'border-red-500' : ''}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-xs">{errors.code}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">
                  {language === 'fr' ? 'Adresse' : 'Address'} *
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs">{errors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    {language === 'fr' ? 'Ville' : 'City'} *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.city ? 'border-red-500' : ''}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs">{errors.city}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regionId">
                    {language === 'fr' ? 'Région' : 'Region'} *
                  </Label>
                  <Select
                    name="regionId"
                    value={formData.regionId}
                    onValueChange={(value) => handleChange({ target: { name: 'regionId', value } } as any)}
                  >
                    <SelectTrigger className={errors.regionId ? 'border-red-500' : ''}>
                      <SelectValue placeholder={language === 'fr' ? 'Sélectionner une région' : 'Select a region'} />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id.toString()}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.regionId && (
                    <p className="text-red-500 text-xs">{errors.regionId}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="departmentId">
                  {language === 'fr' ? 'Département' : 'Department'} *
                </Label>
                <Select
                  name="departmentId"
                  value={formData.departmentId}
                  onValueChange={(value) => handleChange({ target: { name: 'departmentId', value } } as any)}
                  disabled={!formData.regionId}
                >
                  <SelectTrigger className={errors.departmentId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={language === 'fr' ? 'Sélectionner un département' : 'Select a department'} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-red-500 text-xs">{errors.departmentId}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {language === 'fr' ? 'Téléphone' : 'Phone'} *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs">{errors.phone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === 'fr' ? 'Email' : 'Email'} *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">
                    {language === 'fr' ? 'Site Web' : 'Website'}
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="principalName">
                    {language === 'fr' ? 'Nom du Directeur' : 'Principal Name'} *
                  </Label>
                  <Input
                    id="principalName"
                    name="principalName"
                    value={formData.principalName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.principalName ? 'border-red-500' : ''}
                  />
                  {errors.principalName && (
                    <p className="text-red-500 text-xs">{errors.principalName}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>
                  {language === 'fr' ? 'Système Scolaire' : 'School System'} *
                </Label>
                <RadioGroup
                  value={formData.schoolSystem}
                  onValueChange={(value) => handleChange({ target: { name: 'schoolSystem', value } } as any)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fr" id="system-fr" />
                    <Label htmlFor="system-fr">
                      {language === 'fr' ? 'Francophone' : 'French'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="system-en" />
                    <Label htmlFor="system-en">
                      {language === 'fr' ? 'Anglophone' : 'English'}
                    </Label>
                  </div>
                </RadioGroup>
                {errors.schoolSystem && (
                  <p className="text-red-500 text-xs">{errors.schoolSystem}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => 
                    handleChange({ target: { name: 'isActive', value: checked } } as any)
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  {language === 'fr' ? 'École active' : 'Active school'}
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isCreatingSchool || isUpdatingSchool}>
                {(isCreatingSchool || isUpdatingSchool) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {dialogMode === 'create'
                  ? (language === 'fr' ? 'Créer' : 'Create')
                  : (language === 'fr' ? 'Mettre à jour' : 'Update')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}