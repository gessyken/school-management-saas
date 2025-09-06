// Utilitaires de mapping pour les classes entre frontend et backend

export interface BackendClass {
  _id: string;
  classesName: string;
  level: string;
  section?: string;
  specialty?: string;
  educationSystem?: 'francophone' | 'anglophone';
  capacity?: number;
  studentList?: any[];
  mainTeacherInfo?: {
    firstName?: string;
    lastName?: string;
  };
  room?: string;
  subjects?: Array<{
    subjectInfo?: {
      subjectName?: string;
    } | string;
  }>;
  averageGrade?: number;
  attendanceRate?: number;
  schedule?: string;
}

export interface FrontendClass {
  id: string;
  name: string;
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone';
  capacity: number;
  currentStudents: number;
  teacher: string;
  room: string;
  subjects: string[];
  averageGrade?: number;
  attendanceRate?: number;
  schedule?: string;
}

/**
 * Mappe une classe du format backend vers le format frontend
 */
export const mapBackendToFrontend = (backendClass: BackendClass): FrontendClass => {
  return {
    id: backendClass._id,
    name: backendClass.classesName,
    level: backendClass.level,
    section: backendClass.section || 'A',
    specialty: backendClass.specialty,
    educationSystem: backendClass.educationSystem || 'francophone',
    capacity: backendClass.capacity || 0,
    currentStudents: backendClass.studentList?.length || 0,
    teacher: backendClass.mainTeacherInfo?.firstName 
      ? `${backendClass.mainTeacherInfo.firstName} ${backendClass.mainTeacherInfo.lastName}` 
      : 'Non assigné',
    room: backendClass.room || 'Non définie',
    subjects: backendClass.subjects?.map((s: any) => 
      s.subjectInfo?.subjectName || s.subjectInfo || 'Matière'
    ) || [],
    averageGrade: backendClass.averageGrade,
    attendanceRate: backendClass.attendanceRate,
    schedule: backendClass.schedule
  };
};

/**
 * Mappe les données du formulaire frontend vers le format attendu par le backend
 */
export const mapFrontendToBackend = (frontendClass: any) => {
  return {
    classesName: frontendClass.name,
    level: frontendClass.level,
    section: frontendClass.section,
    educationSystem: frontendClass.educationSystem,
    specialty: frontendClass.specialty,
    capacity: frontendClass.capacity,
    description: frontendClass.description,
    status: frontendClass.status || 'Open',
    amountFee: frontendClass.amountFee || 0,
    subjects: frontendClass.subjects || [],
    mainTeacherInfo: frontendClass.mainTeacherInfo,
    year: frontendClass.year || '2024-2025'
  };
};
