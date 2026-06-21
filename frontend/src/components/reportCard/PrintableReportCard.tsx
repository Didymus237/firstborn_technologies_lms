import React from "react";
import { baseURL } from "@/lib/api";

// Types for the component props
interface SubjectMark {
  _id: string;
  subject: { name: string; code: string };
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks?: string;
}

export interface ReportCardData {
  _id: string;
  student: {
    name: string;
    rollNumber: string;
    enrollmentNumber: string;
    photoUrl: string;
  };
  class: { name: string };
  examTerm: { name: string; academicYear: { name: string } };
  marks: SubjectMark[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  finalGrade: string;
  attendancePercentage: number;
  teacherRemarks?: string;
  principalRemarks?: string;
  status: string;
}

interface PrintableReportCardProps {
  data: ReportCardData | null;
}

const PrintableReportCard: React.FC<PrintableReportCardProps> = ({ data }) => {
  if (!data) return <div className="p-4 text-center text-gray-400 italic font-serif">Awaiting Report Card Data...</div>;

  return (
    <>
      <style type="text/css" media="print">
        {`
          @page { size: A4 portrait; margin: 0; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            margin: 0; 
            background: white;
          }
        `}
      </style>
      <div className="bg-white min-h-[297mm] h-auto print:h-[297mm] print:max-h-[297mm] w-full max-w-[210mm] mx-auto p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] print:shadow-none print:w-[210mm] print:max-w-none print:m-0 print:p-8 font-sans text-gray-800 relative z-0 box-border overflow-hidden print:overflow-hidden page-break-inside-avoid">
        
        {/* Decorative Outer Border */}
        <div className="absolute inset-4 border-[3px] border-double border-[#8B1E1E]/30 rounded-lg pointer-events-none print:inset-4" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />
        <div className="absolute inset-5 border border-[#8B1E1E]/10 rounded-sm pointer-events-none print:inset-5" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }} />

      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] z-[-1]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
         <img src="/images/main_logo.png" alt="Firstborn Technologies Watermark" className="w-[500px] h-[500px] object-contain grayscale" />
      </div>

      <div className="relative z-10 px-6 py-4 h-full flex flex-col justify-between">
        {/* Header element */}
        <div className="border-b-[3px] border-[#8B1E1E] pb-4 mb-6 flex items-center justify-between" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 flex items-center justify-center relative bg-transparent pointer-events-none">
              <img src="/images/main_logo.png" alt="Firstborn Technologies Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#8B1E1E] uppercase tracking-wide">Firstborn Technologies</h1>
              <p className="text-sm text-gray-800 font-medium tracking-widest mt-1 uppercase">Excellence & Integrity</p>
              <p className="text-xs text-gray-500 mt-1 italic font-serif">Building futures, transforming minds.</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <h2 className="text-2xl font-serif font-bold tracking-[0.2em] text-[#8B1E1E] mb-2 uppercase border-b border-[#8B1E1E]/30 pb-1">Report Card</h2>
            <div className="inline-block bg-gray-50 px-3 py-1 rounded border border-gray-200">
              <p className="font-semibold text-gray-800 text-sm tracking-wide">{data.examTerm?.name}</p>
              <p className="text-xs text-gray-500">{data.examTerm?.academicYear?.name || "Academic Year - Current"}</p>
            </div>
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="flex gap-8 mb-10 bg-white p-6 border border-gray-200 shadow-sm relative" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          {/* Subtle background pattern for student detail box */}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#8B1E1E]"></div>
          
          <div className="flex-shrink-0 flex items-center justify-center p-2 border border-gray-200 bg-gray-50">
            <img
              src={data.student?.photoUrl?.startsWith('http') ? data.student.photoUrl : data.student?.photoUrl ? `${baseURL}${data.student.photoUrl}` : "https://ui-avatars.com/api/?background=random&color=fff&name=" + data.student?.name}
              alt="Student"
              className="w-28 h-32 object-cover shadow-[0_2px_8px_rgba(0,0,0,0.1)] grayscale-[20%]"
            />
          </div>
          <div className="flex-grow grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-serif">
            <div className="border-b border-gray-100 pb-1"><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-0.5">Student Name</span> <span className="text-gray-900 font-bold text-lg">{data.student?.name}</span></div>
            <div className="border-b border-gray-100 pb-1"><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-0.5">Class & Section</span> <span className="text-gray-900 font-bold">{data.class?.name}</span></div>
            <div className="border-b border-gray-100 pb-1"><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-0.5">Roll Number</span> <span className="text-gray-900 font-bold tracking-wider">{data.student?.rollNumber || "N/A"}</span></div>
            <div className="border-b border-gray-100 pb-1"><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-0.5">Enrollment No.</span> <span className="text-gray-900 font-bold tracking-wider">{data.student?.enrollmentNumber || "N/A"}</span></div>
            <div className="border-b border-gray-100 pb-1"><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-0.5">Attendance</span> <span className="text-gray-900 font-bold">{data.attendancePercentage?.toFixed(1) || 0}%</span></div>
            <div className="border-b border-gray-100 pb-1"><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-0.5">Status</span> <span className={`font-bold uppercase tracking-wider ${data.status === "Pass" || data.status === "Promoted" ? "text-emerald-700" : "text-rose-700"}`}>{data.status || "N/A"}</span></div>
          </div>
        </div>

        {/* Academic Performance Title */}
        <div className="text-center mb-6">
          <h3 className="font-serif text-xl text-gray-800 tracking-widest uppercase inline-block border-b-2 border-gray-300 pb-1 px-8">Academic Performance</h3>
        </div>

        {/* Marks Table */}
        <div className="mb-10 w-full">
          <table className="w-full text-left border-collapse border-b-2 border-[#8B1E1E]">
            <thead>
              <tr className="bg-[#8B1E1E] text-white print:bg-[#8B1E1E] print:text-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-2/5 border border-[#8B1E1E]">Subjects</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center border border-[#8B1E1E]">Max Marks</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center border border-[#8B1E1E]">Marks Obtained</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center border border-[#8B1E1E]">Grade</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center border border-[#8B1E1E]">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.marks?.map((mark, index) => (
                <tr key={mark._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 print:bg-gray-50"} style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                  <td className="py-3 px-4 border-l border-r border-b border-gray-200 font-serif font-medium text-gray-900">{mark.subject?.name}</td>
                  <td className="py-3 px-4 border-l border-r border-b border-gray-200 text-center text-gray-600 font-mono">{mark.maxMarks}</td>
                  <td className="py-3 px-4 border-l border-r border-b border-gray-200 text-center font-bold text-gray-900 font-mono text-lg">{mark.obtainedMarks}</td>
                  <td className="py-3 px-4 border-l border-r border-b border-gray-200 text-center font-bold text-[#8B1E1E] text-lg">{mark.grade}</td>
                  <td className="py-3 px-4 border-l border-r border-b border-gray-200 text-center text-sm italic text-gray-500">{mark.remarks || "-"}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold text-gray-900 print:bg-gray-100 border-t-2 border-[#8B1E1E]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                <td className="py-3 px-4 border border-gray-300 font-serif uppercase tracking-widest text-right">Grand Total</td>
                <td className="py-3 px-4 border border-gray-300 text-center font-mono">{data.totalMaxMarks}</td>
                <td className="py-3 px-4 border border-gray-300 text-center font-mono text-xl">{data.totalObtainedMarks}</td>
                <td className="py-3 px-4 border border-gray-300 text-center font-serif text-xl" colSpan={2}>
                  {data.percentage?.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Grading and Remarks Grid */}
        <div className="grid grid-cols-2 gap-8 mb-auto mt-4">
          {/* Grading Scale */}
          <div>
             <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-200 pb-1">Assessment Scale</h4>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-600 border border-gray-200 p-3 bg-gray-50" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
               <div className="flex justify-between border-b border-gray-200 pb-1"><span>90% - 100%</span> <span className="font-bold text-gray-900">A+</span></div>
               <div className="flex justify-between border-b border-gray-200 pb-1"><span>80% - 89%</span> <span className="font-bold text-gray-900">A</span></div>
               <div className="flex justify-between border-b border-gray-200 pb-1"><span>70% - 79%</span> <span className="font-bold text-gray-900">B</span></div>
               <div className="flex justify-between border-b border-gray-200 pb-1"><span>60% - 69%</span> <span className="font-bold text-gray-900">C</span></div>
               <div className="flex justify-between border-b border-gray-200 pb-1"><span>50% - 59%</span> <span className="font-bold text-gray-900">D</span></div>
               <div className="flex justify-between border-b border-gray-200 pb-1 text-[#8B1E1E]"><span>Below 50%</span> <span className="font-bold">Fail</span></div>
             </div>
          </div>

          {/* Remarks Section */}
          <div className="flex flex-col space-y-4">
            <div className="relative pt-3 border-t border-gray-200">
               <span className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">Class Teacher's Observation</span>
               <p className="font-serif italic text-gray-800 text-sm px-4 pt-2 pb-1 bg-amber-50/30 min-h-[40px] leading-relaxed">
                 "{data.teacherRemarks || "Shows great potential. Keep up the good work!"}"
               </p>
            </div>
            <div className="relative pt-3 border-t border-gray-200">
               <span className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-bold text-gray-500 tracking-widest uppercase">Principal's Observation</span>
               <p className="font-serif italic text-gray-800 text-sm px-4 pt-2 pb-1 bg-amber-50/30 min-h-[40px] leading-relaxed">
                 "{data.principalRemarks || "Excellent progress. Promoted."}"
               </p>
            </div>
          </div>
        </div>

        {/* Final Signatures */}
        <div className="grid grid-cols-3 gap-8 mt-12 pt-8">
           <div className="flex flex-col items-center justify-end">
              <div className="w-48 border-b-2 border-gray-400 border-dashed mb-2 h-16 relative">
                 <div className="absolute bottom-1 left-0 w-full text-center opacity-10">Sign</div>
              </div>
              <p className="font-bold text-xs text-gray-600 uppercase tracking-widest">Class Teacher</p>
           </div>
           <div className="flex flex-col items-center justify-end">
              <div className="w-48 border-b-2 border-gray-400 border-dashed mb-2 h-16 relative">
                 <div className="absolute bottom-1 left-0 w-full text-center opacity-10">Sign</div>
              </div>
              <p className="font-bold text-xs text-gray-600 uppercase tracking-widest">Parent / Guardian</p>
           </div>
           <div className="flex flex-col items-center justify-end">
              <div className="w-48 border-b-2 border-gray-400 border-dashed mb-2 h-16 relative flex items-end justify-center">
                 <div className="absolute bottom-1 left-0 w-full text-center opacity-10">Sign / Seal</div>
              </div>
              <p className="font-bold text-xs text-[#8B1E1E] uppercase tracking-widest">Principal</p>
           </div>
        </div>

        {/* Footer date */}
        <div className="text-center border-t border-gray-100 pt-3 mt-4 shrink-0">
           <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Generated on: {new Date().toLocaleDateString('en-GB')} • Official Academic Record</p>
        </div>

      </div>
    </div>
    </>
  );
};

export default PrintableReportCard;
