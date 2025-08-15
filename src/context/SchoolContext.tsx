import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { schoolService } from '@/services/schoolService';
import { useAuth } from './AuthContext';
import { School, SchoolMember, JoinRequest, SchoolContextType, CreateSchoolDto, UpdateSchoolDto } from '@/types/School';
import { SCHOOL_KEY, TOKEN_KEY } from '@/lib/key';

const SchoolContext = createContext<SchoolContextType>({} as SchoolContextType);
type MemberSchoolRole = 'USER' | 'ADMIN' | 'STUDENT';

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [currentSchool, setCurrentSchool] = useState<School | null>(null);
    const [schools, setSchools] = useState<School[]>([]);
    const [members, setMembers] = useState<SchoolMember[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchools = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await schoolService.getAll();
            console.log("response.items", response)
            console.log("response.items", response.items)
            setSchools(response);

            // Set current school if user has membership
            if (user.currentSchoolId) {
                const school = response.items.find(s => s._id === user.currentSchoolId) ||
                    await schoolService.getById(user.currentSchoolId);
                setCurrentSchool(school);
                await fetchMembers(user.currentSchoolId);
            }
        } catch (err) {
            setError('Failed to load schools');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchMembers = async (schoolId: string) => {
        try {
            const members = await schoolService.getMembers(schoolId);
            setMembers(members);
        } catch (err) {
            setError('Failed to load members');
            console.error(err);
        }
    };

    const fetchJoinRequests = async (schoolId: string) => {
        try {
            const requests = await schoolService.getJoinRequests(schoolId);
            setJoinRequests(requests);
        } catch (err) {
            setError('Failed to load join requests');
            console.error(err);
        }
    };

    const switchSchool = async (schoolId: string) => {
        try {
            setLoading(true);
            const { token, school } = await schoolService.switch(schoolId);
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(SCHOOL_KEY, JSON.stringify(school));
            console.log("token, school", token, school)
            setCurrentSchool(school);
            await fetchMembers(schoolId);
        } catch (err) {
            setError('Failed to switch school');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createSchool = async (data: CreateSchoolDto): Promise<School> => {
        try {
            setLoading(true);
            const school = await schoolService.create(data);
            setSchools(prev => [...prev, school]);
            return school;
        } catch (err) {
            setError('Failed to create school');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateSchool = async (id: string, data: UpdateSchoolDto): Promise<School> => {
        try {
            setLoading(true);
            const school = await schoolService.update(id, data);
            setSchools(prev => prev.map(s => s._id === id ? school : s));
            if (currentSchool?._id === id) {
                setCurrentSchool(school);
            }
            return school;
        } catch (err) {
            setError('Failed to update school');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const requestJoin = async (schoolId: string) => {
        try {
            await schoolService.requestJoin(schoolId);
            // Refresh join requests if we're looking at that school
            if (currentSchool?._id === schoolId) {
                await fetchJoinRequests(schoolId);
            }
        } catch (err) {
            setError('Failed to send join request');
            console.error(err);
            throw err;
        }
    };

    const approveJoinRequest = async (schoolId: string, userId: string) => {
        try {
            await schoolService.approveJoinRequest(schoolId, userId);
            await Promise.all([
                fetchJoinRequests(schoolId),
                fetchMembers(schoolId)
            ]);
        } catch (err) {
            setError('Failed to approve request');
            console.error(err);
            throw err;
        }
    };

    const rejectJoinRequest = async (schoolId: string, userId: string) => {
        try {
            await schoolService.rejectJoinRequest(schoolId, userId);
            await fetchJoinRequests(schoolId);
        } catch (err) {
            setError('Failed to reject request');
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        const storedSchool = localStorage.getItem(SCHOOL_KEY);

        if (user) {
            fetchSchools();
        } else {
            setSchools([]);
            setCurrentSchool(null);
            setMembers([]);
            setJoinRequests([]);
        }
        if (storedSchool) {
            setCurrentSchool(JSON.parse(storedSchool));
        }
    }, [user, fetchSchools]);

    const hasRoleSchool = (role: MemberSchoolRole | MemberSchoolRole[]) => {
        const userMembership = currentSchool.members?.find(
            (m) => m._id === user?._id
        );
        const roles = userMembership?.memberships?.find(
            (m) => m.school === currentSchool._id
        )?.roles;

        if (!roles) return false;

        if (Array.isArray(role)) {
            return role.some(r => roles.includes(r));
        }
        return roles.includes(role);
    };

    return (
        <SchoolContext.Provider
            value={{
                currentSchool,
                setCurrentSchool,
                schools,
                members,
                joinRequests,
                loading,
                error,
                switchSchool,
                createSchool,
                updateSchool,
                requestJoin,
                fetchMembers,
                fetchJoinRequests,
                approveJoinRequest,
                rejectJoinRequest,
                refresh: fetchSchools,
                hasRoleSchool,
            }}
        >
            {children}
        </SchoolContext.Provider>
    );
};

export const useSchool = () => {
    const context = useContext(SchoolContext);
    if (!context) {
        throw new Error('useSchool must be used within a SchoolProvider');
    }
    return context;
};