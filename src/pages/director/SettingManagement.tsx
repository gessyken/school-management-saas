import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

const SettingManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get("tab") || "academic";

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);

  const tabs = [
    { key: "academic", label: t('school.settings.tabs.academic_years') },
    { key: "term", label: t('school.settings.tabs.terms') },
    { key: "sequence", label: t('school.settings.tabs.sequences') },
  ];

  const fetchData = async () => {
    try {
      const [years, termList, sequenceList] = await Promise.all([
        settingService.getAcademicYears(),
        settingService.getTerms(),
        settingService.getSequences(),
      ]);
      setAcademicYears(years);
      setTerms(termList);
      setSequences(sequenceList);
    } catch (error) {
      console.error("Failed to fetch settings data:", error);
      toast({
        title: t('common.error'),
        description: t('school.settings.error.load_data'),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  return (
    <Card className="m-4 shadow-lg border">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl font-bold">
          {t('school.settings.title')}
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
  );
};

export default SettingManagement;