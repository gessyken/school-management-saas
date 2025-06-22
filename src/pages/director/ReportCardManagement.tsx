import {
  AcademicSubject,
  AcademicYearStudent,
} from "@/lib/services/academicService";
import { SubjectInfo } from "@/lib/services/classService";
import { Sequence, Term } from "@/lib/services/settingService";
import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentReportCardProps {
  student: AcademicYearStudent;
  terms: Term[];
  sequences: Sequence[];
  subjects: SubjectInfo[];
  studentMarks: {
    [key: string]: {
      marks?: { currentMark: number };
      rank?: number;
      discipline?: string;
      average?: number;
      absences?: number;
    };
  };
}

const ReportCardManagement: React.FC<StudentReportCardProps> = ({
  student,
  terms,
  sequences,
  subjects,
  studentMarks,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Export PDF
  const exportPDF = async () => {
    if (!reportRef.current) return;

    // Use html2canvas to capture the div as a canvas
    const canvas = await html2canvas(reportRef.current, {
      scale: 2, // improve quality
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // Calculate width/height for A4 size
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(
      `${student.student.fullName || student.student.matricule}_ReportCard.pdf`
    );
  };

  // Export CSV
  const exportCSV = () => {
    // CSV header row
    const header = ["Subject"];
    terms.forEach((term) => {
      const termSeqs = sequences.filter(
        (seq) => seq.term._id === term._id && seq.isActive
      );
      termSeqs.forEach((seq) => header.push(`${term.name} | ${seq.name}`));
      header.push(`${term.name} | Avg`);
    });

    // Rows per subject
    const rows = subjects.map((subject) => {
      const row = [subject.subjectInfo.subjectName];
      terms.forEach((term) => {
        const termSeqs = sequences.filter(
          (seq) => seq.term._id === term._id && seq.isActive
        );
        let avg = 0;
        termSeqs.forEach((seq) => {
          const key = `${student._id}-${term._id}-${seq._id}-${subject.subjectInfo._id}`;
          const mark = studentMarks[key]?.marks?.currentMark ?? 0;
          avg += mark;
          row.push(mark.toFixed(2));
        });
        row.push((avg / termSeqs.length || 0).toFixed(2));
      });
      return row;
    });

    // Compose CSV content
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${student.student.fullName || student.student.matricule}_ReportCard.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={exportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Export as PDF
        </button>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Export as CSV
        </button>
      </div>
      <div
        ref={reportRef}
        className="max-w-6xl mx-auto bg-white p-6 border border-gray-300 rounded-xl shadow print:break-after-page text-sm"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900 uppercase underline mb-6">
          Report Card
        </h2>

        <Card className="mb-8 p-6 shadow-lg border border-gray-200 rounded-lg">
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 text-gray-700">
    <div className="flex items-center space-x-3">
      <User className="text-blue-600" size={24} />
      <div>
        <p className="text-sm font-semibold text-gray-900">Matricule</p>
        <p className="text-base">{student.student.matricule}</p>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <GraduationCap className="text-green-600" size={24} />
      <div>
        <p className="text-sm font-semibold text-gray-900">Full Name</p>
        <p className="text-base">
          {student.student.fullName ||
            `${student.student.firstName} ${student.student.lastName}`}
        </p>
      </div>
    </div>
  </div>
</Card>

{/* Subject-centric Report Table */}
<Card className="overflow-x-auto p-6 shadow-lg border border-gray-200 rounded-lg">
  <Table className="min-w-full border border-gray-300">
    <TableHeader className="bg-gray-50">
      <TableRow>
        <TableHead
        className="w-1/6 text-gray-700 uppercase tracking-wide text-sm font-semibold">
          Subject
        </TableHead>
        {terms.map((term) => (
          <TableHead
            key={term._id}
            colSpan={
              sequences.filter(
                (seq) => seq.term._id === term._id && seq.isActive
              ).length + 1
            }
            className="text-center text-gray-700 uppercase tracking-wide text-sm font-semibold"
          >
            {term.name}
          </TableHead>
        ))}
      </TableRow>
      <TableRow>
      <TableHead  className="w-1/6 text-gray-700 uppercase tracking-wide text-sm font-semibold">
          Name
        </TableHead>
      {/* <TableHead  className="w-1/6 text-gray-700 uppercase tracking-wide text-sm font-semibold">
          Coeff
        </TableHead> */}
        <TableHead className="bg-gray-100" />
        {terms.map((term) => {
          const termSeqs = sequences.filter(
            (seq) => seq.term._id === term._id && seq.isActive
          );
          return (
            <React.Fragment key={term._id}>
              {termSeqs.map((seq) => (
                <TableHead
                  key={seq._id}
                  className="bg-gray-100 text-center text-gray-600 text-xs font-medium"
                >
                  {seq.name}
                </TableHead>
              ))}
              <TableHead className="bg-gray-200 text-center font-semibold text-gray-800 text-xs">
                Avg
              </TableHead>
            </React.Fragment>
          );
        })}
      </TableRow>
    </TableHeader>

    <TableBody>
      {subjects.map((subject, idx) => (
        <TableRow
          key={subject.subjectInfo._id}
          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
          style={{ transition: "background-color 0.3s ease" }}
          // subtle hover effect
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = "#f9fafb")
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#f9fafb")
          }
        >
          <TableCell className="font-semibold text-gray-900">
            {subject.subjectInfo.subjectName}
          </TableCell>
          <TableCell className="font-semibold text-gray-900">
            {subject.coefficient}
          </TableCell>
          {terms.map((term) => {
            const termSeqs = sequences.filter(
              (seq) => seq.term._id === term._id && seq.isActive
            );
            let avg = 0;
            return (
              <React.Fragment key={term._id}>
                {termSeqs.map((seq) => {
                  const key = `${student._id}-${term._id}-${seq._id}-${subject.subjectInfo._id}`;
                  const data = studentMarks[key] ?? {};
                  const mark = Number(
                    data.marks?.currentMark?.toFixed(2) ?? 0
                  );
                  avg += mark;
                  return (
                    <TableCell
                      key={seq._id}
                      title={`Rank: ${data.rank ?? "-"}, Discipline: ${
                        data.discipline ?? "-"
                      }`}
                      className="text-center text-gray-700 font-medium"
                    >
                      {data.marks?.currentMark?.toFixed(2) ?? "-"}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-semibold text-gray-900 bg-gray-100">
                  {termSeqs.length
                    ? (avg / termSeqs.length).toFixed(2)
                    : "-"}
                </TableCell>
              </React.Fragment>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Card>

{/* Summary per term */}
<div className="mt-10 space-y-8">
  {terms.map((term) => {
    const summaryKey = sequences.length===1? `${student._id}-${term._id}-${sequences[0]._id}-summary`: `${student._id}-${term._id}-summary`;
    const termSummary = studentMarks[summaryKey] ?? {};
    return (
      <Card
        key={term._id}
        className="p-6 shadow-lg border border-gray-200 rounded-lg"
      >
        <h4 className="text-xl font-bold text-gray-900 mb-5 border-b border-gray-300 pb-2">
          {term.name} Summary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-700 text-sm">
          <div>
            <p className="text-gray-500 uppercase tracking-wide font-semibold mb-1">
              Overall Average
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {termSummary.average?.toFixed(2) ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 uppercase tracking-wide font-semibold mb-1">
              Rank
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {termSummary.rank ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 uppercase tracking-wide font-semibold mb-1">
              Discipline
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {termSummary.discipline ?? "-"}
            </p>
          </div>
        </div>
      </Card>
    );
  })}
</div>

      </div>
    </div>
  );
};

export default ReportCardManagement;
