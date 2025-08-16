import { useEffect, useState } from "react";
import api from "@/lib/api";
import { SCHOOL_KEY, USER_KEY } from "@/lib/key";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

interface Member {
  _id: string;
  name: string;
  lastName: string;
  firstName: string;
  email: string;
  avatar?: string;
  memberships: {
    school: string;
    roles: string[];
  }[];
}

const possibleRoles = [
  {
    value: "ADMIN",
    label: {
      en: "Administrator",
      fr: "Administrateur"
    }
  },
  {
    value: "DIRECTOR",
    label: {
      en: "Director",
      fr: "Directeur"
    }
  },
  {
    value: "SECRETARY",
    label: {
      en: "Secretary",
      fr: "Secrétaire"
    }
  },
  {
    value: "TEACHER",
    label: {
      en: "Teacher",
      fr: "Enseignant"
    }
  }
];

const ManageMembersPage = () => {
  const { i18n } = useTranslation()
  const language = i18n.language;
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const schoolId: string | null = (() => {
    const stored = localStorage.getItem(SCHOOL_KEY);
    if (!stored) {
      navigate("/schools-select");
      return null;
    }
    try {
      const schoolObj = JSON.parse(stored);
      return schoolObj?._id ?? null;
    } catch {
      return null;
    }
  })();

  const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");

  useEffect(() => {
    if (!schoolId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/schools/${schoolId}/members`);
        setMembers(res.data);
      } catch (err) {
        toast({
          title: t("school.manage_members.error.loading.title"),
          description: t("school.manage_members.error.loading.description"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [schoolId, toast, t]);

  const getRoles = (member: Member) =>
    member.memberships.find((m) => m.school === schoolId)?.roles || [];

  const handleRoleChange = async (memberId: string, newRoles: string[]) => {
    if (!schoolId) return;

    setUpdating(memberId);
    try {
      await api.patch(`/schools/${schoolId}/members/${memberId}/roles`, {
        roles: newRoles,
      });

      toast({
        title: t("school.manage_members.success.update.title"),
        description: t("school.manage_members.success.update.description"),
      });

      setMembers((prev) =>
        prev.map((m) =>
          m._id === memberId
            ? {
              ...m,
              memberships: m.memberships.map((mem) =>
                mem.school === schoolId ? { ...mem, roles: newRoles } : mem
              ),
            }
            : m
        )
      );
    } catch {
      toast({
        title: t("school.manage_members.error.update.title"),
        description: t("school.manage_members.error.update.description"),
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const filteredMembers = members.filter(member =>
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-3">{t("school.manage_members.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">
          {t("school.manage_members.title")}
        </h2>
        <div className="w-full md:w-64">
          <Input
            placeholder={t("school.manage_members.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? t("school.manage_members.search.no_results")
              : t("school.manage_members.empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.firstName?.[0]?.toUpperCase() ?? ''}
                    {member.lastName?.[0]?.toUpperCase() ?? ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold leading-none tracking-tight">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("school.manage_members.roles.label")}</Label>
                  <MultiSelect
                    options={possibleRoles.map(p => ({
                      value: p.value,
                      label: p.label[language]
                    }))}
                    value={getRoles(member)}
                    disabled={
                      updating === member._id || member._id === currentUser._id
                    }
                    onChange={(newRoles) =>
                      handleRoleChange(member._id, newRoles)
                    }
                  />
                </div>
                <Button
                  disabled={
                    updating === member._id ||
                    member._id === currentUser._id ||
                    updating !== null
                  }
                  onClick={() => handleRoleChange(member._id, getRoles(member))}
                  className="w-full"
                  size="sm"
                >
                  {updating === member._id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {t("school.manage_members.update_button")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageMembersPage;