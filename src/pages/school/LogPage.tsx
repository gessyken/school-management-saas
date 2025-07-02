import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { SCHOOL_KEY } from "@/lib/key";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  _id: string;
  action: string;
  module: string;
  description: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  metadata?: any;
}

const ALL_ACTIONS = ["ALL", "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "ERROR", "VIEW", "PAYMENT"];
const ALL_MODULES = ["ALL", "Student", "Teacher", "AcademicYear", "Fee", "Classes", "Sequence", "Subject", "System", "Auth"];

const SchoolLogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("ALL");
  const [filterModule, setFilterModule] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const schoolId = (() => {
    const stored = localStorage.getItem(SCHOOL_KEY);
    if (!stored) {
      navigate("/schools-select");
    }
    return stored || null;
  })();

  useEffect(() => {
    if (!schoolId) return;

    const fetchLogs = async () => {
      try {
        const res = await api.get(`/logs/school`);
        setLogs(res.data);
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les logs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [schoolId]);

  // Filter logs based on current filters and search text
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const actionMatch = filterAction === "ALL" || log.action.toUpperCase() === filterAction;
      const moduleMatch = filterModule === "ALL" || log.module === filterModule;
      const searchMatch =
        log.description.toLowerCase().includes(searchText.toLowerCase()) ||
        log.module.toLowerCase().includes(searchText.toLowerCase()) ||
        (log.user?.firstName?.toLowerCase().includes(searchText.toLowerCase()) || false) ||
        (log.user?.lastName?.toLowerCase().includes(searchText.toLowerCase()) || false);

      return actionMatch && moduleMatch && searchMatch;
    });
  }, [logs, filterAction, filterModule, searchText]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 space-x-3 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Chargement des logs...</span>
      </div>
    );
  }

  // Action badge color helper
  function getActionColor(action: string) {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "text-green-600 border-green-600";
      case "UPDATE":
        return "text-yellow-600 border-yellow-600";
      case "DELETE":
        return "text-red-600 border-red-600";
      case "ERROR":
        return "text-red-700 border-red-700";
      case "LOGIN":
        return "text-blue-600 border-blue-600";
      case "LOGOUT":
        return "text-gray-600 border-gray-600";
      case "PAYMENT":
        return "text-purple-600 border-purple-600";
      case "VIEW":
      default:
        return "text-skyblue border-skyblue";
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-8">
      <h2 className="text-3xl font-extrabold text-skyblue border-b-2 border-skyblue pb-2">
        Logs de l’école
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col">
          <label htmlFor="actionFilter" className="mb-1 font-semibold text-gray-700">
            Filtrer par action
          </label>
          <select
            id="actionFilter"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-skyblue"
          >
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="moduleFilter" className="mb-1 font-semibold text-gray-700">
            Filtrer par module
          </label>
          <select
            id="moduleFilter"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-skyblue"
          >
            {ALL_MODULES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col min-w-[250px]">
          <label htmlFor="searchInput" className="mb-1 font-semibold text-gray-700">
            Recherche
          </label>
          <input
            id="searchInput"
            type="search"
            placeholder="Chercher description, module, utilisateur..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-skyblue"
          />
        </div>
      </div>

      {/* Logs list */}
      {filteredLogs.length === 0 ? (
        <p className="text-center text-gray-500 italic mt-8">Aucun log correspondant.</p>
      ) : (
        <div className="space-y-6">
          {filteredLogs.map((log) => (
            <Card
              key={log._id}
              className="border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-lg text-gray-900 truncate"
                    title={log.description}
                  >
                    {log.description}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`uppercase font-bold tracking-wide ${getActionColor(log.action)}`}
                >
                  {log.action}
                </Badge>
              </CardHeader>

              <CardContent className="text-sm text-gray-700 space-y-2">
                <div>
                  <span className="font-semibold">Module :</span> {log.module}
                </div>

                {log.user && (
                  <div>
                    <span className="font-semibold">Utilisateur :</span>{" "}
                    <span className="italic text-gray-800">
                      {log.user.firstName ?? ""} {log.user.lastName ?? ""}{" "}
                      <span className="text-xs text-gray-500">
                        ({log.user.email ?? "N/A"})
                      </span>
                    </span>
                  </div>
                )}

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer font-medium select-none hover:text-skyblue">
                      Voir les métadonnées
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto bg-gray-100 p-3 rounded text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolLogsPage;
