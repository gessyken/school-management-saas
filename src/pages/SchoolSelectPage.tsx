import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import SchoolCreateModal from "@/components/modals/SchoolCreateModal";
import { USER_KEY } from "@/lib/key";

interface School {
  _id: string;
  name: string;
  email: string;
  logoUrl?: string;
  subdomain?: string;
  accessStatus?: string;
  roles: string[];
  status: string;
  isMember: boolean;
  members?: any[]; // make sure this field exists in the response
}

interface User {
  _id: string;
  // Add more fields if necessary
}

const SchoolSelectPage = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 1. Get user from localStorage
  const user: User | null = (() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  })();
  console.log(user);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await api.get("/schools");
        setSchools(res.data);
        console.log(res.data);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les écoles",
          variant: "destructive",
        });
      }
    };
    fetchSchools();
  }, []);

  const handleSwitchSchool = async (schoolId: string) => {
    setSwitchLoading(true);
    try {
      const res = await api.post("/schools/switch", { schoolId });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de changer d'école",
        variant: "destructive",
      });
    } finally {
      setSwitchLoading(false);
    }
  };

  const requestToJoin = async (schoolId: string) => {
    try {
      await api.post(`/schools/${schoolId}/request-join`);
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été soumise.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la demande.",
        variant: "destructive",
      });
    }
  };

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const memberSchools = user
    ? filteredSchools.filter((s) =>
        s.members?.some((opt) => opt._id.toString() === user._id.toString())
      )
    : [];

  const joinableSchools = user
    ? filteredSchools.filter(
        (s) =>
          !s.members?.some(
            (opt) => opt._id.toString() === user._id.toString()
          ) && s.accessStatus === "open"
      )
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-skyblue/10 to-white p-4">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Rechercher une école..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => setShowCreateModal(true)} variant="ghost">
            <PlusCircle className="w-5 h-5 mr-1" /> Ajouter
          </Button>
        </div>

        {/* Member Schools */}
        {memberSchools.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2 text-skyblue">Vos écoles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {memberSchools.map((school) => (
                <Card
                  key={school._id}
                  className="hover:shadow-md transition"
                >
                  <CardHeader className="text-center">
                    <img
                      src={school.logoUrl || "/default-school-logo.png"}
                      alt="Logo école"
                      className="mx-auto h-16 w-16 object-contain rounded-full"
                    />
                    <h4 className="text-lg font-semibold mt-2">
                      {school.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Rôles:
                      {school?.members
                        ?.find(
                          (opt) => opt._id.toString() === user._id.toString()
                        )
                        ?.memberships
                        ?.find(
                          (opt) => opt?.school === school._id
                        )
                        ?.roles?.join(", ")}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleSwitchSchool(school._id)}
                      className="w-full"
                      disabled={switchLoading}
                    >
                      {switchLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Entrer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Joinable Schools */}
        {joinableSchools.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-2 text-skyblue">
              Écoles disponibles (ouvertes)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {joinableSchools.map((school) => (
                <Card
                  key={school._id}
                  className="hover:shadow-md transition"
                >
                  <CardHeader className="text-center">
                    <img
                      src={school.logoUrl || "/default-school-logo.png"}
                      alt="Logo école"
                      className="mx-auto h-16 w-16 object-contain rounded-full"
                    />
                    <h4 className="text-lg font-semibold mt-2">
                      {school.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Accès: Ouvert
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => requestToJoin(school._id)}
                      variant="outline"
                      className="w-full"
                    >
                      Demander à rejoindre
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {showCreateModal && (
          <SchoolCreateModal
            open={showCreateModal}
            onSuccess={(schoolId) => handleSwitchSchool(schoolId)}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SchoolSelectPage;
