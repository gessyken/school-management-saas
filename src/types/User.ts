export interface AuthResponse {
    message: string;
    data: {
        refreshToken?: string;
        message: {
            en: string;
            fr: string;
        };
        token?: string;
        user?: User;
    }
}

export interface User {
    id: string;
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    currentSchoolId: string;
    phoneNumber: string;
    roles: string[] | 'admin' | 'vendor' | 'customer' | 'delivery';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    isVerified: boolean;
    memberships?: {
        school: {
            _id: string;
            name: string;
            email?: string;
            subdomain?: string;
            accessStatus?: string;
        };
        roles: string[];
        status: string;
        joinedAt: string;
    }[];
}
