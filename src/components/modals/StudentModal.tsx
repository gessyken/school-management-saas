import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Mail, Phone, MapPin, Users, BookOpen, GraduationCap, IdCard } from 'lucide-react';
import { classesService } from '@/services/classesService';

interface Student {
  id?: string;
  _id?: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  class: string;
  classesId?: string;
  average?: number;
  status: 'active' | 'inactive' | 'graduated' | 'transferred' | 'suspended' | 'withdrawn';
  enrollmentDate: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  birthDate?: string;
  avatar?: string;
  level?: string;
  matricule?: string;
  gender?: string;
  city?: string;
  nationality?: string;
  academicStatus?: 'regular' | 'repeating' | 'advanced';
  attendanceRate?: number;
  isActive?: boolean;
  birthPlace?: string;
  parentOccupation?: string;
  parentAddress?: string;
  bloodGroup?: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  student?: Student | null | any;
  mode: 'create' | 'edit' | 'view';
}

// Education system configuration
const EDUCATION_SYSTEMS = {
  francophone: {
    name: 'Francophone',
    sections: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    levels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']
  },
  anglophone: {
    name: 'Anglophone',
    sections: ['A', 'B', 'C', 'D'],
    levels: ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth']
  },
  bilingue: {
    name: 'Bilingue',
    sections: ['A', 'B', 'C', 'D', 'E'],
    levels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Lower Sixth', 'Upper Sixth']
  }
};

const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  student,
  mode
}) => {
  const [formData, setFormData] = useState<Student>({
    id: '',
    _id: "",
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    class: '',
    status: 'active',
    enrollmentDate: new Date().toISOString().split('T')[0],
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    birthDate: '',
    level: '',
    matricule: '',
    gender: '',
    city: '',
    nationality: 'Cameroonian',
    academicStatus: 'regular',
    average: 0,
    attendanceRate: 0,
    isActive: true,
    birthPlace: '',
    parentOccupation: '',
    parentAddress: '',
    bloodGroup: '',
    allergies: [],
    medicalConditions: [],
  });
  
  const [availableClasses, setAvailableClasses] = useState<Array<{ _id: string; id: string; name: string; level: string; section: string; educationSystem: string }>>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedEducationSystem, setSelectedEducationSystem] = useState<string>('');
  // const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const cls = await classesService.getClasses();
        const items = Array.isArray(cls) ? cls.map((c: any) => ({
          id: c.id || c._id,
          _id: c.id || c._id,
          name: c.name || c.classesName || c.className,
          level: c.level,
          section: c.section,
          educationSystem: c.educationSystem
        })) : [];
        setAvailableClasses(items);
      } catch {
        setAvailableClasses([]);
      }
    };
    loadClasses();

    if (student) {
      // Extract education system and section from existing class data
      const studentClass = availableClasses.find(c => c.id === student.classesId);
      const educationSystem = studentClass?.educationSystem || '';
      // const section = studentClass?.section || '';
      const level = student.level || studentClass?.level || '';

      setFormData({
        _id: student._id || student.id || '',
        id: student._id || student.id || '',
        name: student.name || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        class: student.class || '',
        classesId: student.classesId || '',
        status: student.status || 'active',
        enrollmentDate: new Date(student.enrollmentDate)?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
        address: student.address || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        parentEmail: student.parentEmail || '',
        birthDate: new Date(student.birthDate)?.toISOString()?.split('T')[0] || '',
        avatar: student.avatar || '',
        level: student.level || studentClass?.level||'' ,
        matricule: student.matricule || '',
        gender: student.gender || '',
        city: student.city || '',
        nationality: student.nationality || 'Cameroonian',
        academicStatus: student.academicStatus || 'regular',
        average: student.average || 0,
        attendanceRate: student.attendanceRate || 0,
        isActive: student.isActive !== undefined ? student.isActive : true,
        birthPlace: student.birthPlace || '',
        parentOccupation: student.parentOccupation || '',
        parentAddress: student.parentAddress || '',
        bloodGroup: student.bloodGroup || '',
        allergies: student.allergies || [],
        medicalConditions: student.medicalConditions || [],
        emergencyContact: student.emergencyContact || { name: '', relationship: '', phone: '' }
        
      });
      
      setSelectedEducationSystem(educationSystem);
      setSelectedLevel(level);
      setSelectedClassId(student.classesId || '');
    } else {
      setFormData({
        name: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        class: '',
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        address: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        birthDate: '',
        level: '',
        matricule: '',
        gender: '',
        city: '',
        nationality: 'Cameroonian',
        academicStatus: 'regular',
        average: 0,
        attendanceRate: 0,
        isActive: true,
        birthPlace: '',
        parentOccupation: '',
        parentAddress: '',
        bloodGroup: '',
        allergies: [],
        medicalConditions: [],
        emergencyContact: { name: '', relationship: '', phone: '' },
      });
      setSelectedEducationSystem('');
      // setSelectedSection('');
      setSelectedLevel('');
      setSelectedClassId('');
    }
  }, [student, isOpen]);

  // Filter classes based on selected education system, section, and level
  const filteredClasses = availableClasses.filter(cls => {
    if (selectedEducationSystem && cls.educationSystem !== selectedEducationSystem) return false;
    // if (selectedSection && cls.section !== selectedSection) return false;
    if (selectedLevel && cls.level !== selectedLevel) return false;
    return true;
  });

  // Get available sections based on selected education system
  // const availableSections = selectedEducationSystem 
  //   ? EDUCATION_SYSTEMS[selectedEducationSystem as keyof typeof EDUCATION_SYSTEMS]?.sections || []
  //   : [];

  // Get available levels based on selected education system
  const availableLevels = selectedEducationSystem 
    ? EDUCATION_SYSTEMS[selectedEducationSystem as keyof typeof EDUCATION_SYSTEMS]?.levels || []
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate name from firstName and lastName if not provided
    const finalFormData = {
      ...formData,
      name: formData.name || `${formData.firstName} ${formData.lastName}`.trim(),
      level: selectedLevel || formData.level
    };

    const selectedClass = availableClasses.find(c => c.id === selectedClassId);
    const payload = {
      ...finalFormData,
      class: selectedClassId || selectedClass?._id,
      className: selectedClass?.name || finalFormData.class,
      classesId: selectedClassId || finalFormData.classesId,
      level: selectedLevel || finalFormData.level,
    };

    onSave(payload);
  };

  const handleChange = (field: keyof Student, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact!,
        [field]: value
      }
    }));
  };

  const handleEducationSystemChange = (value: string) => {
    setSelectedEducationSystem(value);
    // setSelectedSection('');
    setSelectedLevel('');
    handleChange('level', '');
    setSelectedClassId('');
    handleChange('classesId', '');
  };

  // const handleSectionChange = (value: string) => {
  //   setSelectedSection(value);
  //   setSelectedLevel('');
  //   setSelectedClassId('');
  // };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setSelectedClassId('');
    handleChange('level', value);
    handleChange('classesId', '');
  };

  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
    handleChange('classesId', value);
    const selectedClass = availableClasses.find(c => c.id === value);
    if (selectedClass) {
      handleChange('level', selectedClass.level);
      setSelectedLevel(selectedClass.level);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Ajouter un élève';
      case 'edit': return 'Modifier l\'élève';
      case 'view': return 'Détails de l\'élève';
      default: return 'Élève';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Actif</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactif</Badge>;
      case 'graduated':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Diplômé</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Suspendu</Badge>;
      case 'transferred':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Transféré</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Retiré</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getAcademicStatusBadge = (status: string) => {
    switch (status) {
      case 'regular':
        return <Badge variant="outline" className="text-xs">Régulier</Badge>;
      case 'repeating':
        return <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Redoublant</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Avancé</Badge>;
      default:
        return null;
    }
  };

  if (mode === 'view') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{formData.name}</span>
            </DialogTitle>
            <DialogDescription>
              Fiche détaillée de l'élève
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* En-tête avec avatar et informations principales */}
            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {formData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{formData.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-muted-foreground">{formData.class}</p>
                  {formData.level && (
                    <Badge variant="outline" className="text-xs">
                      {formData.level}
                    </Badge>
                  )}
                  {getStatusBadge(formData.status)}
                  {formData.academicStatus && getAcademicStatusBadge(formData.academicStatus)}
                </div>
                {formData.matricule && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <IdCard className="w-4 h-4 inline mr-1" />
                    {formData.matricule}
                  </p>
                )}
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Informations personnelles
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">Nom :</span> {formData.lastName}</p>
                    <p><span className="font-medium">Prénom :</span> {formData.firstName}</p>
                  </div>
                  <p><span className="font-medium">Email :</span> {formData.email}</p>
                  <p><span className="font-medium">Téléphone :</span> {formData.phone || 'Non renseigné'}</p>
                  {formData.gender && <p><span className="font-medium">Genre :</span> {formData.gender}</p>}
                  {formData.birthDate && (
                    <p><span className="font-medium">Date de naissance :</span> {new Date(formData.birthDate).toLocaleDateString('fr-FR')}</p>
                  )}
                  {formData.birthPlace && <p><span className="font-medium">Lieu de naissance :</span> {formData.birthPlace}</p>}
                  {formData.nationality && <p><span className="font-medium">Nationalité :</span> {formData.nationality}</p>}
                  {formData.address && <p><span className="font-medium">Adresse :</span> {formData.address}</p>}
                  {formData.city && <p><span className="font-medium">Ville :</span> {formData.city}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Contact des parents
                </h4>
                <div className="space-y-3 pl-6">
                  {formData.parentName && <p><span className="font-medium">Nom :</span> {formData.parentName}</p>}
                  {formData.parentEmail && <p><span className="font-medium">Email :</span> {formData.parentEmail}</p>}
                  {formData.parentPhone && <p><span className="font-medium">Téléphone :</span> {formData.parentPhone}</p>}
                  {formData.parentOccupation && <p><span className="font-medium">Profession :</span> {formData.parentOccupation}</p>}
                  {formData.parentAddress && <p><span className="font-medium">Adresse :</span> {formData.parentAddress}</p>}
                </div>

                {formData.emergencyContact?.name && (
                  <>
                    <h4 className="font-semibold flex items-center mt-4">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact d'urgence
                    </h4>
                    <div className="space-y-2 pl-6">
                      <p><span className="font-medium">Nom :</span> {formData.emergencyContact.name}</p>
                      <p><span className="font-medium">Relation :</span> {formData.emergencyContact.relationship}</p>
                      <p><span className="font-medium">Téléphone :</span> {formData.emergencyContact.phone}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Informations scolaires et médicales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Informations scolaires
                </h4>
                <div className="space-y-2 pl-6">
                  <p><span className="font-medium">Classe :</span> {formData.class || 'Non assigné'}</p>
                  <p><span className="font-medium">Niveau :</span> {formData.level || 'Non spécifié'}</p>
                  <p><span className="font-medium">Statut académique :</span> {formData.academicStatus}</p>
                  <p><span className="font-medium">Date d'inscription :</span> {new Date(formData.enrollmentDate).toLocaleDateString('fr-FR')}</p>
                  {formData.matricule && <p><span className="font-medium">Matricule :</span> {formData.matricule}</p>}
                </div>
              </div>

              {(formData.bloodGroup || formData.allergies?.length || formData.medicalConditions?.length) && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Informations médicales
                  </h4>
                  <div className="space-y-2 pl-6">
                    {formData.bloodGroup && <p><span className="font-medium">Groupe sanguin :</span> {formData.bloodGroup}</p>}
                    {formData.allergies && formData.allergies.length > 0 && (
                      <p><span className="font-medium">Allergies :</span> {formData.allergies.join(', ')}</p>
                    )}
                    {formData.medicalConditions && formData.medicalConditions.length > 0 && (
                      <p><span className="font-medium">Conditions médicales :</span> {formData.medicalConditions.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={() => {/* Switch to edit mode */ }}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Remplissez les informations pour ajouter un nouvel élève'
              : 'Modifiez les informations de l\'élève'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations personnelles</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Prénom"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Nom"
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender">Genre *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculin</SelectItem>
                    <SelectItem value="female">Féminin</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="birthDate">Date de naissance *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="birthPlace">Lieu de naissance</Label>
                <Input
                  id="birthPlace"
                  value={formData.birthPlace}
                  onChange={(e) => handleChange('birthPlace', e.target.value)}
                  placeholder="Lieu de naissance"
                />
              </div>

              <div>
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  placeholder="Nationalité"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@exemple.fr"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Adresse complète"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Ville"
                />
              </div>
            </div>
          </div>

          {/* Informations scolaires */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations scolaires</h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="educationSystem">Système éducatif *</Label>
                <Select value={selectedEducationSystem} onValueChange={handleEducationSystemChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le système" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="francophone">Francophone</SelectItem>
                    <SelectItem value="anglophone">Anglophone</SelectItem>
                    <SelectItem value="bilingue">Bilingue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div>
                <Label htmlFor="section">Section *</Label>
                <Select 
                  value={selectedSection} 
                  onValueChange={handleSectionChange}
                  disabled={!selectedEducationSystem}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la section" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              <div>
                <Label htmlFor="level">Niveau *</Label>
                <Select 
                  value={selectedLevel || formData.level} 
                  onValueChange={handleLevelChange}
                  disabled={!selectedEducationSystem}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="class">Classe *</Label>
                <Select 
                  value={selectedClassId || formData.classesId} 
                  onValueChange={handleClassChange}
                  disabled={!selectedLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="enrollmentDate">Date d'inscription *</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={(e) => handleChange('enrollmentDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="graduated">Diplômé</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                    <SelectItem value="transferred">Transféré</SelectItem>
                    <SelectItem value="withdrawn">Retiré</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicStatus">Statut académique</Label>
                <Select value={formData.academicStatus} onValueChange={(value) => handleChange('academicStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut académique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Régulier</SelectItem>
                    <SelectItem value="repeating">Redoublant</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact des parents */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact des parents/tuteurs</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="parentName">Nom du parent *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleChange('parentName', e.target.value)}
                  placeholder="Nom Prénom"
                  required
                />
              </div>

              <div>
                <Label htmlFor="parentEmail">Email du parent</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleChange('parentEmail', e.target.value)}
                  placeholder="parent@email.fr"
                />
              </div>

              <div>
                <Label htmlFor="parentPhone">Téléphone du parent *</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => handleChange('parentPhone', e.target.value)}
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentOccupation">Profession du parent</Label>
                <Input
                  id="parentOccupation"
                  value={formData.parentOccupation}
                  onChange={(e) => handleChange('parentOccupation', e.target.value)}
                  placeholder="Profession"
                />
              </div>

              <div>
                <Label htmlFor="parentAddress">Adresse des parents</Label>
                <Input
                  id="parentAddress"
                  value={formData.parentAddress}
                  onChange={(e) => handleChange('parentAddress', e.target.value)}
                  placeholder="Adresse des parents"
                />
              </div>
            </div>
          </div>

          {/* Contact d'urgence */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact d'urgence</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergencyName">Nom</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact?.name}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <Label htmlFor="emergencyRelationship">Relation</Label>
                <Input
                  id="emergencyRelationship"
                  value={formData.emergencyContact?.relationship}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  placeholder="Relation avec l'élève"
                />
              </div>

              <div>
                <Label htmlFor="emergencyPhone">Téléphone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyContact?.phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations médicales</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bloodGroup">Groupe sanguin</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleChange('bloodGroup', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={formData.allergies?.join(', ')}
                  onChange={(e) => handleChange('allergies', e.target.value.split(',').map(a => a.trim()))}
                  placeholder="Allergies (séparées par des virgules)"
                />
              </div>

              <div>
                <Label htmlFor="medicalConditions">Conditions médicales</Label>
                <Input
                  id="medicalConditions"
                  value={formData.medicalConditions?.join(', ')}
                  onChange={(e) => handleChange('medicalConditions', e.target.value.split(',').map(m => m.trim()))}
                  placeholder="Conditions médicales (séparées par des virgules)"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Ajouter' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentModal;