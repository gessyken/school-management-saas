import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { SCHOOL_KEY } from "@/lib/key";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface UserRequest {
  _id: string;
  name: string;
  email: string;
}

interface JoinRequestsPageProps {
  schoolId: string; // The current school to manage requests for
}

const JoinRequestsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const schoolId: String | null = (() => {
    const stored = localStorage.getItem(SCHOOL_KEY);
    if (!stored) {
      navigate("/schools-select");
    }
    let schoolObj = JSON.parse(stored);
    return schoolObj ? schoolObj._id : null;
  })();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch pending join requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/schools/${schoolId}/join-requests`);
      setRequests(res?.data?.joinRequests || []);
      //   console.log(res.data.joinRequests)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes d'adhésion.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [schoolId]);

  // Approve a join request
  const approveRequest = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      await api.post(`/schools/${schoolId}/join-requests/${userId}/approve`);
      toast({
        title: "Demande approuvée",
        description: "L'utilisateur a été ajouté à l'école.",
      });
      setRequests((prev) => prev.filter((r) => r._id !== userId));
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject a join request
  const rejectRequest = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      await api.post(`/schools/${schoolId}/join-requests/${userId}/reject`);
      toast({
        title: "Demande rejetée",
        description: "La demande d'adhésion a été refusée.",
      });
      setRequests((prev) => prev.filter((r) => r._id !== userId));
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-skyblue" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-sky-700">
        {t("membership.pendingTitle")}
      </h2>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500">{t("membership.noPending")}</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id} className="shadow-sm">
              <CardHeader className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{request.name}</h3>
                  <p className="text-sm text-gray-500">{request.email}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rejectRequest(request._id)}
                    disabled={actionLoadingId === request._id}
                    className="text-red-600 border-red-600 hover:bg-red-100"
                  >
                    {actionLoadingId === request._id ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      t("membership.reject")
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => approveRequest(request._id)}
                    disabled={actionLoadingId === request._id}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    {actionLoadingId === request._id ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      t("membership.approve")
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinRequestsPage;
