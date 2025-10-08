export interface AcademicYear {
  _id: string;
  id: string;
  student: any;
  school: string;
  year: string;
  classes: string | Class;
  hasRepeated: boolean;
  hasCompleted: boolean;
  terms: Term[];
  fees: Fee[];
  rank: number;
  status: 'Active' | 'Completed' | 'Withdrawn' | 'Suspended';
  enrollmentDate: string;
  completionDate?: string;
  notes?: string;
  overallAverage?: number;
  overallStatus?: string;
  hasFailingSubjects?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  level: string;
  classInfo?: string;
}

export interface Class {
  _id: string;
  id: string;
  name: string;
  level: string;
  section: string;
  educationSystem: 'francophone' | 'anglophone' | 'bilingue';
}

export interface Term {
  termInfo: string | TermDetail;
  average: number;
  rank: number;
  sequences: Sequence[];
  discipline: string;
}

export interface TermDetail {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}

export interface Sequence {
  sequenceInfo: string | SequenceDetail;
  isActive: boolean;
  average: number;
  rank: number;
  absences: number;
  subjects: Subject[];
  discipline: string;
}

export interface SequenceDetail {
  _id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}

export interface Subject {
  subjectInfo: string | SubjectDetail;
  isActive: boolean;
  discipline: string;
  rank: number;
  marks: {
    currentMark: number;
    isActive: boolean;
    modified: MarkModification[];
  };
}

export interface SubjectDetail {
  _id: string;
  name: string;
  code: string;
  coefficient: number;
  weeklyHours: number;
}

export interface MarkModification {
  preMark: number;
  modMark: number;
  modifiedBy: {
    name: string;
    userId: string;
  };
  dateModified: string;
  reason?: string;
}

export interface Fee {
  billID: string;
  type: 'Tuition' | 'Books' | 'Uniform' | 'Transport' | 'Other';
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Check' | 'Credit Card';
  amount: number;
  paymentDate: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  reference?: string;
}

export interface CreateAcademicYearsRequest {
  studentIds: string[];
  year: string;
  classId: string;
}

export interface CreateAcademicYearsResponse {
  message: string;
  summary: {
    created: number;
    updated: number;
    failedCount: number;
    failed: Array<{ studentId: string; error: string }>;
    totalProcessed: number;
  };
}

export interface UpdateMarkRequest {
  academicYearId: string;
  termInfo: string;
  sequenceInfo: string;
  subjectInfo: string;
  newMark: number;
}

export interface BulkUpdateMarksRequest {
  updates: UpdateMarkRequest[];
}

export interface PerformanceSummary {
  subjectCount: number;
  failingSubjects: boolean;
  overallAverage: number;
  status: string;
  completionStatus: string;
  riskLevel: string;
}

export interface FeeSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentRate: number;
  transactionCount: number;
}

export interface ClassAcademicOverview {
  classInfo: Class;
  year: string;
  totalStudents: number;
  averageClassAverage: number;
  studentsCompleted: number;
  studentsAtRisk: number;
  topPerformers: Array<{
    student: Student;
    average: number;
    status: string;
    rank: number;
  }>;
  performanceDistribution: {
    excellent: number;
    veryGood: number;
    good: number;
    average: number;
    belowAverage: number;
  };
}

export interface FeeAnalytics {
  totalStudents: number;
  totalFeesExpected: number;
  totalFeesCollected: number;
  collectionRate: number;
  paymentMethods: Record<string, number>;
  feeTypes: Record<string, number>;
  outstandingPayments: Array<{
    student: Student;
    class: Class;
    amountDue: number;
    paymentRate: number;
  }>;
}

export interface RankCalculationRequest {
  classId: string;
  year: string;
  termId?: string;
  sequenceId?: string;
  subjectId?: string;
}

export interface PromotionRequest {
  classId: string;
  year: string;
  currentLevel: string;
  passedLevel: string;
  newYear: string;
  passedClassId: string;
  failClassId: string;
}