import { useEffect, useState } from "react";
import api from "@/lib/api";
import { SCHOOL_KEY, USER_KEY } from "@/lib/key";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { useNavigate } from "react-router-dom";

interface Member {
  _id: string;
  name: string;
  email: string;
  memberships: {
    school: string;
    roles: string[];
  }[];
}

const possibleRoles = ["ADMIN", 'DIRECTOR', 'SECRETARY', 'TEACHER'];

const ManageMembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const schoolId: String | null = (() => {
    const stored = localStorage.getItem(SCHOOL_KEY);
    if (!stored) {
      navigate("/schools-select");
    }
    let schoolObj = JSON.parse(stored)
    return schoolObj ? schoolObj._id : null;
  })();
  const currentUser = JSON.parse(localStorage.getItem(USER_KEY) || "{}");

  useEffect(() => {
    if (!schoolId) return;
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/schools/${schoolId}/members`);
        setMembers(res.data);
        console.log(res.data);
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les membres",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [schoolId]);

  const getRoles = (member: Member) =>
    member.memberships.find((m) => m.school === schoolId)?.roles || [];

  const handleRoleChange = async (memberId: string, newRoles: string[]) => {
    if (!schoolId) return;
    setUpdating(memberId);
    try {
      await api.patch(`/schools/${schoolId}/members/${memberId}/roles`, {
        roles: newRoles,
      });
      toast({ title: "Rôles mis à jour avec succès" });
      setMembers((prev) =>
        prev.map((m) =>
          m._id === memberId
            ? {
                ...m,
                memberships: m.memberships.map((mem) =>
                  mem.school === schoolId
                    ? { ...mem, roles: newRoles }
                    : mem
                ),
              }
            : m
        )
      );
       navigate("/school-dashboard/members");
    } catch {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour des rôles",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Chargement des membres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-skyblue">
        Gérer les membres de l’école
      </h2>

      {members.length === 0 ? (
        <p className="text-muted-foreground">Aucun membre pour cette école.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {members.map((member) => (
            <Card key={member._id}>
              <CardHeader>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {member.email}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <MultiSelect
                  options={possibleRoles}
                  value={getRoles(member)}
                  disabled={updating === member._id || member._id === currentUser._id}
                  onChange={(newRoles) =>
                    handleRoleChange(member._id, newRoles)
                  }
                />
                <Button
                  disabled={
                    updating === member._id || member._id === currentUser._id
                  }
                  onClick={() =>
                    handleRoleChange(member._id, getRoles(member))
                  }
                >
                  {updating === member._id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Mettre à jour les rôles
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
