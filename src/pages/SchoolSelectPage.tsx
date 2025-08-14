import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, PlusCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/header/Header";
import SchoolCreateModal from "@/components/modals/SchoolCreateModal";
import { useSchool } from "@/context/SchoolContext";
import { useAuth } from "@/context/AuthContext";
import { School } from "@/types/School";

interface SchoolCardProps {
  school: School;
  action: () => void;
  actionLabel: string;
  actionVariant?: "default" | "outline";
  loading?: boolean;
  roles?: string[];
}

const SchoolCard = ({
  school,
  action,
  actionLabel,
  actionVariant = "default",
  loading = false,
  roles,
}: SchoolCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-xl transition duration-300 h-full flex flex-col">
      <CardHeader className="flex flex-col items-center text-center space-y-2 flex-grow">
        <img
          src={school.logoUrl || "/default-school-logo.png"}
          alt={t('school.logoAlt')}
          className="h-16 w-16 object-cover rounded-full border"
        />
        <h4 className="text-lg font-semibold">{school.name}</h4>
        {school.email && (
          <p className="text-xs text-muted-foreground">{school.email}</p>
        )}
        {roles && (
          <p className="text-xs text-muted-foreground">
            {t('school.rolesLabel')}: {roles.join(", ")}
          </p>
        )}
        {school.accessStatus === 'active' && (
          <span className="text-xs text-green-500">
            {t('school.statusActive')}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <Button
          onClick={action}
          className="w-full"
          variant={actionVariant}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

const SchoolSelectPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    schools,
    loading: schoolsLoading,
    error: schoolsError,
    currentSchool,
    switchSchool,
    createSchool,
    requestJoin,
    refresh: refreshSchools,
  } = useSchool();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (schoolsLoading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }

    return () => clearInterval(interval);
  }, [schoolsLoading]);

  useEffect(() => {
    if (schoolsError) {
      toast({
        title: t('school.loadErrorTitle'),
        description: t('school.loadErrorDescription'),
        variant: "destructive",
      });
    }
  }, [schoolsError, toast, t]);

  const handleSwitchSchool = async (schoolId: string) => {
    setActionLoading(`switch-${schoolId}`);
    try {
      await switchSchool(schoolId);
      navigate("/school-dashboard");
    } catch (error) {
      toast({
        title: t('school.switchErrorTitle'),
        description: t('school.switchErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestToJoin = async (schoolId: string) => {
    setActionLoading(`join-${schoolId}`);
    try {
      await requestJoin(schoolId);
      toast({
        title: t('school.joinRequestSuccessTitle'),
        description: t('school.joinRequestSuccessDescription'),
      });
      refreshSchools();
    } catch (error) {
      toast({
        title: t('school.joinRequestErrorTitle'),
        description: t('school.joinRequestErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSchoolSuccess = async (newSchool: School) => {
    try {
      await handleSwitchSchool(newSchool._id);
    } catch (error) {
      toast({
        title: t('school.createSuccessSwitchErrorTitle'),
        description: t('school.createSuccessSwitchErrorDescription'),
        variant: "destructive",
      });
    }
    setShowCreateModal(false);
  };

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  console.log("filteredSchools",filteredSchools)
  const memberSchools = user
    ? filteredSchools.filter((s) =>
        s.members?.some((m) => m._id === user._id)
      )
    : [];

  const joinableSchools = user
    ? filteredSchools.filter(
        (s) =>
          !s.members?.some((m) => m._id === user._id) &&
          s.memberShipAccessStatus
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-background p-6">
      <Header />

      <div className="w-full max-w-6xl mx-auto space-y-10 mt-6">
        {schoolsLoading && (
          <div>
            <p className="text-primary font-medium mb-2">
              {t('school.loadingMessage')}
            </p>
            <Progress value={progress} className="h-2 bg-muted" />
          </div>
        )}

        {!schoolsLoading && (
          <>
            {/* Search and Create School */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-primary">
                {t('school.selectTitle')}
              </h2>
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  placeholder={t('school.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                >
                  <PlusCircle className="w-5 h-5 mr-1" /> 
                  {t('school.createButton')}
                </Button>
              </div>
            </div>

            {/* Member Schools */}
            {memberSchools.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  {t('school.yourSchoolsTitle')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {memberSchools.map((school) => {
                    const userMembership = school.members?.find(
                      (m) => m._id === user?._id
                    );
                    const roles = userMembership?.memberships?.find(
                      (m) => m.school === school._id
                    )?.roles;

                    return (
                      <SchoolCard
                        key={school._id}
                        school={school}
                        action={() => handleSwitchSchool(school._id)}
                        actionLabel={t('school.enterButton')}
                        loading={actionLoading === `switch-${school._id}`}
                        roles={roles}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Joinable Schools */}
            {joinableSchools.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-primary mb-4">
                  {t('school.joinableSchoolsTitle')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {joinableSchools.map((school) => (
                    <SchoolCard
                      key={school._id}
                      school={school}
                      action={() => handleRequestToJoin(school._id)}
                      actionLabel={t('school.requestJoinButton')}
                      actionVariant="outline"
                      loading={actionLoading === `join-${school._id}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No Schools Message */}
            {memberSchools.length === 0 && joinableSchools.length === 0 && (
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  {search
                    ? t('school.noResultsMessage')
                    : t('school.noSchoolsMessage')}
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <PlusCircle className="w-5 h-5 mr-1" />
                  {t('school.createFirstSchoolButton')}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Create School Modal */}
        {showCreateModal && (
          <SchoolCreateModal
            open={showCreateModal}
            onSuccess={handleCreateSchoolSuccess}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SchoolSelectPage;