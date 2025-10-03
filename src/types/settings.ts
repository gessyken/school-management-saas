export interface AcademicYear {
  _id: string;
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  description?: string;
  terms: Term[];
  school: string;
  progressPercentage?: number;
  durationInDays?: number;
  metadata?: {
    createdBy: string;
    lastModifiedBy?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Term {
  _id: string;
  id: string;
  name: string;
  code: string;
  order: number;
  type: 'term' | 'semester' | 'quarter' | 'trimester' | 'custom';
  academicYear: string | AcademicYear;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  description?: string;
  sequences: Sequence[];
  school: string;
  settings: {
    allowsGrading: boolean;
    allowsAttendance: boolean;
    maximumSequences: number;
  };
  progressPercentage?: number;
  durationInDays?: number;
  createdBy: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sequence {
  _id: string;
  id: string;
  name: string;
  code: string;
  order: number;
  term: string | Term;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  description?: string;
  objectives?: string;
  school: string;
  settings: {
    allowsGrading: boolean;
    allowsAttendance: boolean;
    maximumAssessments: number;
    weight: number;
  };
  progressPercentage?: number;
  daysRemaining?: number;
  durationInDays?: number;
  createdBy: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicYearProgress {
  academicYear: string;
  totalTerms: number;
  activeTerms: number;
  completedTerms: number;
  totalSequences: number;
  completedSequences: number;
  overallProgress: number;
}

export interface CreateAcademicYearData {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  description?: string;
}

export interface CreateTermData {
  name: string;
  code: string;
  order: number;
  type?: 'term' | 'semester' | 'quarter' | 'trimester' | 'custom';
  academicYear: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  description?: string;
  settings?: {
    allowsGrading?: boolean;
    allowsAttendance?: boolean;
    maximumSequences?: number;
  };
}

export interface CreateSequenceData {
  name: string;
  code: string;
  order: number;
  term: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  description?: string;
  objectives?: string;
  settings?: {
    allowsGrading?: boolean;
    allowsAttendance?: boolean;
    maximumAssessments?: number;
    weight?: number;
  };
}

export interface BulkUpdateTermStatusData {
  termIds: string[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface DateValidationData {
  startDate: string;
  endDate: string;
  academicYearId?: string;
}