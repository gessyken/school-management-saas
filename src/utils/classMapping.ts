// Utilitaires de mapping pour les classes entre frontend et backend

export interface BackendClass {
  _id: string;
  name: string;
  classesName?: string; // Legacy field
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone' | 'bilingue';
  capacity: number;
  currentStudents?: number;
  studentList?: any[];
  teacher?: string;
  mainTeacher?: string | {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  mainTeacherInfo?: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  room: string;
  description?: string;
  subjects?: string[] | Array<{
    _id?: string;
    id?: string;
    subject?: string;
    subjectInfo?: {
      _id?: string;
      id?: string;
      name?: string;
      subjectName?: string;
      code?: string;
    } | string;
    name?: string;
  }>;
  subjectDetails?: Array<{
    subject: string | {
      _id?: string;
      id?: string;
      name?: string;
    };
    coefficient: number;
    teacher?: string;
    weeklyHours: number;
    isActive: boolean;
  }>;
  averageGrade?: number;
  attendanceRate?: number;
  schedule?: string;
  year: string;
  status: 'Open' | 'Closed' | 'Active' | 'Inactive';
  amountFee?: number;
  isActive?: boolean;
  createdBy?: string | {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface FrontendClass {
  id: string;
  name: string;
  level: string;
  section: string;
  specialty?: string;
  educationSystem: 'francophone' | 'anglophone' | 'bilingue';
  capacity: number;
  currentStudents: number;
  teacher: string;
  mainTeacher?: string;
  room: string;
  description?: string;
  subjects: string[];
  subjectDetails?: Array<{
    subject: string;
    coefficient: number;
    teacher?: string;
    weeklyHours: number;
    isActive: boolean;
  }>;
  averageGrade?: number;
  attendanceRate?: number;
  schedule?: string;
  year: string;
  status: string;
  amountFee?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Mappe une classe du format backend vers le format frontend
 */
export const mapBackendToFrontend = (backendClass: any): FrontendClass => {
  console.log("Backend class data:", backendClass);
  
  // Extract teacher name from various possible fields
  const getTeacherName = (): string => {
    if (backendClass.teacher && typeof backendClass.teacher === 'string') {
      return backendClass.teacher;
    }
    
    if (backendClass.mainTeacherInfo) {
      const teacher = backendClass.mainTeacherInfo;
      if (teacher.firstName || teacher.lastName) {
        return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
      }
      return teacher.email || 'Non assigné';
    }
    
    if (backendClass.mainTeacher && typeof backendClass.mainTeacher === 'object') {
      const teacher = backendClass.mainTeacher;
      if (teacher.firstName || teacher.lastName) {
        return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
      }
      return teacher.email || 'Non assigné';
    }
    
    return 'Non assigné';
  };

  // Extract main teacher ID
  const getMainTeacherId = (): string | undefined => {
    if (backendClass.mainTeacher) {
      if (typeof backendClass.mainTeacher === 'string') {
        return backendClass.mainTeacher;
      }
      return backendClass.mainTeacher._id || backendClass.mainTeacher.id;
    }
    if (backendClass.mainTeacherInfo) {
      return backendClass.mainTeacherInfo._id || backendClass.mainTeacherInfo.id;
    }
    return undefined;
  };

  // Extract subjects array
  const getSubjects = (): string[] => {
    if (!backendClass.subjects) return [];
    
    if (Array.isArray(backendClass.subjects)) {
      return backendClass.subjects.map((subject: any) => {
        if (typeof subject === 'string') return subject;
        if (subject.name) return subject.name;
        if (subject.subjectInfo) {
          if (typeof subject.subjectInfo === 'string') return subject.subjectInfo;
          return subject.subjectInfo.name || subject.subjectInfo.subjectName || 'Matière';
        }
        return 'Matière';
      });
    }
    return [];
  };

  // Extract subject details
  const getSubjectDetails = () => {
    if (!backendClass.subjectDetails) return undefined;
    
    return backendClass.subjectDetails.map((detail: any) => ({
      subject: typeof detail.subject === 'string' ? detail.subject : 
               detail.subject?._id || detail.subject?.id || '',
      coefficient: detail.coefficient || 1,
      teacher: detail.teacher,
      weeklyHours: detail.weeklyHours || 4,
      isActive: detail.isActive !== undefined ? detail.isActive : true
    }));
  };

  // Calculate current students
  const getCurrentStudents = (): number => {
    if (backendClass.currentStudents !== undefined) {
      return backendClass.currentStudents;
    }
    if (backendClass.studentList && Array.isArray(backendClass.studentList)) {
      return backendClass.studentList.length;
    }
    return 0;
  };

  return {
    id: backendClass._id || backendClass.id,
    name: backendClass.name || backendClass.classesName || '',
    level: backendClass.level || '',
    section: backendClass.section || 'A',
    specialty: backendClass.specialty,
    educationSystem: backendClass.educationSystem || 'francophone',
    capacity: backendClass.capacity || 0,
    currentStudents: getCurrentStudents(),
    teacher: getTeacherName(),
    mainTeacher: getMainTeacherId(),
    room: backendClass.room || 'Non définie',
    description: backendClass.description,
    subjects: getSubjects(),
    subjectDetails: getSubjectDetails(),
    averageGrade: backendClass.averageGrade,
    attendanceRate: backendClass.attendanceRate,
    schedule: backendClass.schedule,
    year: backendClass.year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    status: backendClass.status || 'Open',
    amountFee: backendClass.amountFee || 0,
    isActive: backendClass.isActive !== undefined ? backendClass.isActive : true,
    createdAt: backendClass.createdAt,
    updatedAt: backendClass.updatedAt
  };
};

/**
 * Mappe les données du formulaire frontend vers le format attendu par le backend
 */
import { FRANCOPHONE_LEVELS, ANGLOPHONE_LEVELS } from '@/constants/cameroonEducation';

const resolveLevelName = (idOrName: string): string => {
  if (!idOrName) return idOrName;
  const all = [...FRANCOPHONE_LEVELS, ...ANGLOPHONE_LEVELS];
  const byId = all.find(l => l.id === idOrName);
  if (byId) return byId.name;
  // if already a display name, return as-is
  const byName = all.find(l => l.name === idOrName);
  return byName ? byName.name : idOrName;
};

export const mapFrontendToBackend = (frontendClass: any) => {
  const levelName = resolveLevelName(frontendClass.level);
  const shouldIncludeSpecialty = levelName === 'Terminale' || levelName === 'Upper Sixth';
  
  // Prepare subject details for backend
  const prepareSubjectDetails = () => {
    if (!frontendClass.subjectDetails || !Array.isArray(frontendClass.subjectDetails)) {
      return undefined;
    }
    
    return frontendClass.subjectDetails.map((detail: any) => ({
      subject: detail.subject,
      coefficient: detail.coefficient || 1,
      teacher: detail.teacher || undefined,
      weeklyHours: detail.weeklyHours || 4,
      isActive: detail.isActive !== undefined ? detail.isActive : true
    }));
  };

  return {
    name: frontendClass.name,
    classesName: frontendClass.name, // Keep for backward compatibility
    level: levelName,
    section: frontendClass.section,
    educationSystem: frontendClass.educationSystem,
    specialty: shouldIncludeSpecialty ? frontendClass.specialty : undefined,
    capacity: frontendClass.capacity,
    currentStudents: frontendClass.currentStudents || 0,
    teacher: frontendClass.teacher,
    mainTeacher: frontendClass.mainTeacher || undefined,
    room: frontendClass.room,
    description: frontendClass.description,
    subjects: frontendClass.subjects || [],
    subjectDetails: prepareSubjectDetails(),
    averageGrade: frontendClass.averageGrade,
    attendanceRate: frontendClass.attendanceRate,
    schedule: frontendClass.schedule,
    year: frontendClass.year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    status: frontendClass.status || 'Open',
    amountFee: frontendClass.amountFee || 0,
    isActive: frontendClass.isActive !== undefined ? frontendClass.isActive : true
  };
};

/**
 * Mappe les données pour la création en masse
 */
export const mapBulkFrontendToBackend = (frontendClasses: any[]) => {
  return frontendClasses.map(frontendClass => mapFrontendToBackend(frontendClass));
};

/**
 * Mappe les données pour la mise à jour partielle
 */
export const mapUpdateFrontendToBackend = (frontendClass: any) => {
  const updateData: any = {};
  
  // Only include fields that are actually provided
  if (frontendClass.name !== undefined) updateData.name = frontendClass.name;
  if (frontendClass.level !== undefined) updateData.level = resolveLevelName(frontendClass.level);
  if (frontendClass.section !== undefined) updateData.section = frontendClass.section;
  if (frontendClass.educationSystem !== undefined) updateData.educationSystem = frontendClass.educationSystem;
  if (frontendClass.specialty !== undefined) updateData.specialty = frontendClass.specialty;
  if (frontendClass.capacity !== undefined) updateData.capacity = frontendClass.capacity;
  if (frontendClass.currentStudents !== undefined) updateData.currentStudents = frontendClass.currentStudents;
  if (frontendClass.teacher !== undefined) updateData.teacher = frontendClass.teacher;
  if (frontendClass.mainTeacher !== undefined) updateData.mainTeacher = frontendClass.mainTeacher;
  if (frontendClass.room !== undefined) updateData.room = frontendClass.room;
  if (frontendClass.description !== undefined) updateData.description = frontendClass.description;
  if (frontendClass.subjects !== undefined) updateData.subjects = frontendClass.subjects;
  if (frontendClass.subjectDetails !== undefined) updateData.subjectDetails = frontendClass.subjectDetails;
  if (frontendClass.averageGrade !== undefined) updateData.averageGrade = frontendClass.averageGrade;
  if (frontendClass.attendanceRate !== undefined) updateData.attendanceRate = frontendClass.attendanceRate;
  if (frontendClass.schedule !== undefined) updateData.schedule = frontendClass.schedule;
  if (frontendClass.year !== undefined) updateData.year = frontendClass.year;
  if (frontendClass.status !== undefined) updateData.status = frontendClass.status;
  if (frontendClass.amountFee !== undefined) updateData.amountFee = frontendClass.amountFee;
  if (frontendClass.isActive !== undefined) updateData.isActive = frontendClass.isActive;
  
  return updateData;
};