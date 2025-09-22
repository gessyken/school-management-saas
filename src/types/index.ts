// Types communs utilisés dans toute l'application

// Utilisateur
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'accountant' | 'parent';
  avatar?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  memberships?: Array<{
    school: School;
    roles: string[];
  }>;
  created_at: string;
  updated_at: string;
}

// Création/Mise à jour d'utilisateur
export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'teacher' | 'accountant' | 'parent';
  phone?: string;
  avatar?: File;
}

// École
export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  system_type: 'francophone' | 'anglophone';
  region?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

// Création/Mise à jour d'école
export interface SchoolInput {
  name: string;
  address: string;
  phone: string;
  email: string;
  system_type: 'francophone' | 'anglophone' | 'bilingue';
  region?: string;
  department?: string;
  logo?: File;
}

// Année académique
export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
}

// Classe
export interface Class {
  id: string;
  name: string;
  level: string; // CI, CP, CE1, etc. ou Class 1, Class 2, etc.
  section: string; // A, B, C, etc.
  capacity: number;
  teacher_id?: string;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

// Élève
export interface Student {
  id: string;
  registration_number: string; // Matricule auto-généré
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  birth_date: string;
  birth_place: string;
  nationality: string;
  address: string;
  photo?: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  class_id: string;
  school_id: string;
  academic_year_id: string;
  // Informations des parents
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  parent_address?: string;
  parent_occupation?: string;
  created_at: string;
  updated_at: string;
}

// Création/Mise à jour d'élève
export interface StudentInput {
  registration_number?: string; // Peut être auto-généré
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  birth_date: string;
  birth_place: string;
  nationality: string;
  address: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  class_id: string;
  photo?: File;
  // Informations des parents
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  parent_address?: string;
  parent_occupation?: string;
}

// Matière
export interface Subject {
  id: string;
  name: string;
  code: string;
  coefficient: number;
  category: string; // Scientifique, Littéraire, etc.
  class_id: string;
  teacher_id?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

// Note
export interface Grade {
  id: string;
  value: number; // Note sur 20
  evaluation_type: 'exam' | 'test' | 'homework' | 'project';
  evaluation_date: string;
  comment?: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

// Création/Mise à jour de note
export interface GradeInput {
  value: number;
  evaluation_type: 'exam' | 'test' | 'homework' | 'project';
  evaluation_date: string;
  comment?: string;
  student_id: string;
  subject_id: string;
  class_id: string;
}

// Entrée de notes en masse
export interface BulkGradeInput {
  evaluation_type: 'exam' | 'test' | 'homework' | 'project';
  evaluation_date: string;
  subject_id: string;
  class_id: string;
  grades: Array<{
    student_id: string;
    value: number;
    comment?: string;
  }>;
}

// Présence
export interface Attendance {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  comment?: string;
  student_id: string;
  class_id: string;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

// Frais de scolarité
export interface Fee {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  description?: string;
  is_mandatory: boolean;
  class_id: string;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

// Paiement
export interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'check';
  reference?: string;
  comment?: string;
  student_id: string;
  fee_id: string;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

// Création/Mise à jour de paiement
export interface PaymentInput {
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'check';
  reference?: string;
  comment?: string;
  student_id: string;
  fee_id: string;
  discount?: {
    type: 'sibling' | 'scholarship' | 'other';
    percentage: number;
    reason?: string;
  };
}

// Bulletin
export interface ReportCard {
  id: string;
  average: number;
  rank: number;
  comment?: string;
  term: 'first' | 'second' | 'third' | 'annual';
  student_id: string;
  class_id: string;
  academic_year_id: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  grades?: Grade[];
}

// Statistiques du tableau de bord
export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  attendance_rate: number;
  payment_rate: number;
  average_performance: number;
  recent_activities: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
}

// Réponse d'API paginée
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Réponse d'authentification
export interface AuthResponse {
  token: string;
  user: User;
  schools: School[];
}