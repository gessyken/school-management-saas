import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pencil, Trash, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  settingService,
  AcademicYear,
  Term,
  Sequence,
} from "@/lib/services/settingService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AcademicYearManagement from "./setting/ACADEMICYEARS";
import TermManagement from "./setting/TermManagement";
import SequenceManagement from "./setting/SequenceManagement";

const tabs = [
  { key: "academic", label: "Academic Years" },
  { key: "term", label: "Terms" },
  { key: "sequence", label: "Sequences" },
];

const SettingManagement = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get("tab") || "academic";

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);

  const fetchData = async () => {
    const [years, termList, sequenceList] = await Promise.all([
      settingService.getAcademicYears(),
      settingService.getTerms(),
      settingService.getSequences(),
    ]);
    setAcademicYears(years);
    setTerms(termList);
    setSequences(sequenceList);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  return (
    <AppLayout>
      <Card className="m-4 shadow-lg border">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-bold">
            Settings Management
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.key}
                  variant={tab.key === activeTab ? "default" : "outline"}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          {activeTab === "academic" && <AcademicYearManagement />}
          {activeTab === "term" && <TermManagement />}
          {activeTab === "sequence" && <SequenceManagement />}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default SettingManagement;
