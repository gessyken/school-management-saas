import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Loader2, Search, Send, X } from "lucide-react";
import { SCHOOL_KEY } from "@/lib/key";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface UserRequest {
  _id: string;
  name: string;
  email: string;
}

const JoinRequestsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<UserRequest[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Fetch pending join requests
  const fetchRequests = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/schools/${schoolId}/join-requests`);
      setRequests(res?.data?.joinRequests || []);
    } catch (error) {
      toast({
        title: t("school.join_requests.error.loading.title"),
        description: t("school.join_requests.error.loading.description"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [schoolId]);

  // Search users by email
  const searchUsers = async () => {
    if (!searchEmail.trim()) return;
    
    setSearchLoading(true);
    try {
      const res = await api.get(`/users/search?email=${searchEmail}`);
      console.log(res?.data?.users)
      setSearchResults(res?.data?.users);
    } catch (error) {
      toast({
        title: t("school.join_requests.error.search.title"),
        description: t("school.join_requests.error.search.description"),
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send join request to user
  const sendJoinRequest = async (userId: string) => {
    if (!schoolId) return;
    
    setSendingRequest(true);
    try {
      await api.post(`/schools/${schoolId}/invite`, { userId });
      toast({
        title: t("school.join_requests.success.invite_sent.title"),
        description: t("school.join_requests.success.invite_sent.description"),
      });
      setIsModalOpen(false);
      setSearchEmail("");
      setSearchResults([]);
    } catch (error) {
      toast({
        title: t("school.join_requests.error.invite.title"),
        description: t("school.join_requests.error.invite.description"),
        variant: "destructive",
      });
    } finally {
      setSendingRequest(false);
    }
  };

  // Approve a join request
  const approveRequest = async (userId: string) => {
    if (!schoolId) return;
    
    setActionLoadingId(userId);
    try {
      await api.post(`/schools/${schoolId}/join-requests/${userId}/approve`);
      toast({
        title: t("school.join_requests.success.approved.title"),
        description: t("school.join_requests.success.approved.description"),
      });
      setRequests((prev) => prev.filter((r) => r._id !== userId));
    } catch {
      toast({
        title: t("school.join_requests.error.approve.title"),
        description: t("school.join_requests.error.approve.description"),
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject a join request
  const rejectRequest = async (userId: string) => {
    if (!schoolId) return;
    
    setActionLoadingId(userId);
    try {
      await api.post(`/schools/${schoolId}/join-requests/${userId}/reject`);
      toast({
        title: t("school.join_requests.success.rejected.title"),
        description: t("school.join_requests.success.rejected.description"),
      });
      setRequests((prev) => prev.filter((r) => r._id !== userId));
    } catch {
      toast({
        title: t("school.join_requests.error.reject.title"),
        description: t("school.join_requests.error.reject.description"),
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">
          {t("school.join_requests.title")}
        </h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              {t("school.join_requests.invite_button")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("school.join_requests.invite_modal.title")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t("school.join_requests.invite_modal.search_placeholder")}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                />
                <Button onClick={searchUsers} disabled={!searchEmail.trim()}>
                  {searchLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">
                    {t("school.join_requests.invite_modal.results")}
                  </h4>
                  <div className="border rounded-lg divide-y">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => sendJoinRequest(user._id)}
                          disabled={sendingRequest}
                        >
                          {sendingRequest ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          <span className="ml-2">
                            {t("school.join_requests.invite_modal.send_button")}
                          </span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && searchLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              )}

              {searchResults.length === 0 &&
                !searchLoading &&
                searchEmail.trim() && (
                  <p className="text-center text-muted-foreground py-4">
                    {t("school.join_requests.invite_modal.no_results")}
                  </p>
                )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {requests.length === 0 ? (
        <p className="text-center text-muted-foreground">
          {t("school.join_requests.empty")}
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id}>
              <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {request.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rejectRequest(request._id)}
                    disabled={actionLoadingId === request._id}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    {actionLoadingId === request._id ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      t("school.join_requests.reject_button")
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approveRequest(request._id)}
                    disabled={actionLoadingId === request._id}
                  >
                    {actionLoadingId === request._id ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      t("school.join_requests.approve_button")
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