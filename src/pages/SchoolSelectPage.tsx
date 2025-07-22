import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import SchoolCreateModal from "@/components/modals/SchoolCreateModal";
import { SCHOOL_KEY, TOKEN_KEY, USER_KEY } from "@/lib/key";
import Header from "@/components/header/Header";
import { Progress } from "@/components/ui/progress"; // Make sure this is available
import { useTranslation } from "react-i18next";

interface School {
  _id: string;
  name: string;
  email: string;
  logoUrl?: string;
  subdomain?: string;
  accessStatus?: string;
  memberShipAccessStatus?: boolean;
  roles: string[];
  status: string;
  isMember: boolean;
  members?: any[];
}

interface User {
  _id: string;
}

const SchoolSelectPage = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const user: User | null = (() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  })();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const simulateProgress = () => {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);
    };

    const fetchSchools = async () => {
      simulateProgress();
      try {
        const res = await api.get("/schools");
        setSchools(res.data);
        setProgress(100);
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les écoles",
          variant: "destructive",
        });
      } finally {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    fetchSchools();
  }, []);

  const handleSwitchSchool = async (school: School) => {
    setSwitchLoading(true);
    try {
      const res = await api.post("/schools/switch", { schoolId: school._id });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(SCHOOL_KEY, JSON.stringify(school));
      navigate("/school-dashboard");
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
        s.members?.some((opt) => opt._id === user._id)
      )
    : [];

  const joinableSchools = user
    ? filteredSchools.filter(
        (s) =>
          !s.members?.some((opt) => opt._id === user._id) &&
          s.memberShipAccessStatus
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-skyblue/10 to-white p-6">
      <Header />

      <div className="w-full max-w-6xl mx-auto space-y-10 mt-6">
        {loading && (
          <div>
            <p className="text-sky-600 font-medium mb-2">
              {t("schools.loading")}
            </p>
            <Progress value={progress} className="h-2 bg-gray-200 rounded" />
          </div>
        )}

        {!loading && (
          <>
            {/* Top: Search + Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-sky-600">
                {t("schools.selectSchool")}
              </h2>
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  aria-label={t("schools.searchPlaceholder")}
                  placeholder={t("schools.searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                  aria-label={t("schools.newSchool")}
                >
                  <PlusCircle className="w-5 h-5 mr-1" />
                  {t("schools.newSchool")}
                </Button>
              </div>
            </div>

            {/* Member Schools */}
            {memberSchools.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-sky-600 mb-4">
                  {t("schools.yourSchools")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {memberSchools.map((school) => (
                    <Card
                      key={school._id}
                      className="hover:shadow-xl transition-shadow duration-300"
                      aria-label={`${school.name} ${t(
                        "schools.schoolCardLabel"
                      )}`}
                    >
                      <CardHeader className="flex flex-col items-center text-center space-y-2">
                        <img
                          src={school.logoUrl || "/default-school-logo.png"}
                          alt={t("schools.schoolLogoAlt", {
                            name: school.name,
                          })}
                          className="h-16 w-16 object-cover rounded-full border"
                        />
                        <h4 className="text-lg font-semibold truncate max-w-full">
                          {school.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {t("schools.roles")}{" "}
                          {school?.members
                            ?.find((opt) => opt._id === user._id)
                            ?.memberships?.find((m) => m.school === school._id)
                            ?.roles?.join(", ") || "—"}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handleSwitchSchool(school)}
                          className="w-full"
                          disabled={switchLoading}
                        >
                          {switchLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {t("schools.enter")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Joinable Schools */}
            {joinableSchools.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-sky-600 mb-4">
                  {t("schools.availableSchools")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {joinableSchools.map((school) => (
                    <Card
                      key={school._id}
                      className="hover:shadow-xl transition-shadow duration-300"
                      aria-label={`${school.name} ${t(
                        "schools.schoolCardLabel"
                      )}`}
                    >
                      <CardHeader className="flex flex-col items-center text-center space-y-2">
                        <img
                          src={school.logoUrl || "/default-school-logo.png"}
                          alt={t("schools.schoolLogoAlt", {
                            name: school.name,
                          })}
                          className="h-16 w-16 object-cover rounded-full border"
                        />
                        <h4 className="text-lg font-semibold truncate max-w-full">
                          {school.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {t("schools.accessOpen")}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => requestToJoin(school._id)}
                          variant="outline"
                          className="w-full"
                        >
                          {t("schools.requestToJoin")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
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
