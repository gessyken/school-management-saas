// types/school.ts
export interface School {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    subdomain?: string;
    plan: 'FREE' | 'BASIC' | 'PRO';
    billing: {
        status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
        trialEndsAt?: Date;
        nextInvoiceDue?: Date;
    };
    accessStatus: 'active' | 'suspended' | 'blocked';
    memberShipAccessStatus: boolean;
    createdAt: Date;
    updatedAt: Date;
    members: any;
}

export interface SchoolMember {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    roles: string[];
}

export interface JoinRequest {
    _id: string;
    name: string;
    email: string;
    requestedAt: Date;
}

export interface CreateSchoolDto {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    subdomain?: string;
}

export interface UpdateSchoolDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
    subdomain?: string;
    memberShipAccessStatus?: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
}

export interface SchoolContextType {
    currentSchool: School | null;
    setCurrentSchool;
    schools: School[];
    members: SchoolMember[];
    joinRequests: JoinRequest[];
    loading: boolean;
    error: string | null;
    switchSchool: (schoolId: string) => Promise<void>;
    createSchool: (data: CreateSchoolDto) => Promise<School>;
    updateSchool: (id: string, data: UpdateSchoolDto) => Promise<School>;
    requestJoin: (schoolId: string) => Promise<void>;
    fetchMembers;
    fetchJoinRequests;
    approveJoinRequest: (schoolId: string, userId: string) => Promise<void>;
    rejectJoinRequest: (schoolId: string, userId: string) => Promise<void>;
    refresh: () => Promise<void>;
    hasRoleSchool;
}