import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import PrintableReportCard from "../components/reportCard/PrintableReportCard";
import type { ReportCardData } from "../components/reportCard/PrintableReportCard";
import { Printer, Search, Lock, Unlock } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";

const ReportCardView: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch initial dropdown data
    const fetchSelectData = async () => {
      try {
        const [clsRes, termRes] = await Promise.all([
          api.get("/classes"),
          api.get("/exam-terms"),
        ]);
        setClasses(clsRes.data.data || []);
        setTerms(termRes.data.terms || []);
      } catch (err) {
        console.error("Error fetching classes/terms", err);
      }
    };
    fetchSelectData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      api.get(`/classes/${selectedClass}`)
        .then((res) => {
          setStudents(res.data.students || []);
        })
        .catch(console.error);
    }
  }, [selectedClass]);

  const fetchReportCard = async () => {
    if (!selectedStudent || !selectedTerm) return;
    setLoading(true);
    setError("");
    setReportData(null);
    try {
      const res = await api.get(`/report-cards/${selectedStudent}/${selectedTerm}`);
      setReportData(res.data.reportCard);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load report card. Please ensure marks have been generated.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async () => {
    if (!selectedTerm) return;
    if (!window.confirm("Are you sure you want to toggle the lock status for this term?")) return;
    try {
      await api.put(`/exam-terms/${selectedTerm}/lock`);
      setTerms(terms.map((t) => t._id === selectedTerm ? { ...t, isLocked: !t.isLocked } : t));
    } catch (err) {
      console.error(err);
      alert("Failed to toggle lock state");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Controls Section - Hidden from printing */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 print:hidden border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 flex items-center tracking-tight relative z-10">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mr-3 border border-rose-100">
              <Search className="w-5 h-5 text-[#8B1E1E]" />
            </div>
            Find Report Card
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-10">
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Class</label>
              <select 
                className="w-full border-0 border-b-2 border-gray-200 bg-transparent py-2 px-0 text-gray-900 font-medium focus:ring-0 focus:border-[#8B1E1E] transition-colors cursor-pointer appearance-none outline-none"
                value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(""); }}
              >
                <option value="" disabled className="text-gray-400">Select Class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Student</label>
              <select 
                className="w-full border-0 border-b-2 border-gray-200 bg-transparent py-2 px-0 text-gray-900 font-medium focus:ring-0 focus:border-[#8B1E1E] transition-colors cursor-pointer appearance-none outline-none disabled:opacity-50"
                value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedClass}
              >
                <option value="" disabled className="text-gray-400">Select Student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Term</label>
              <select 
                className="w-full border-0 border-b-2 border-gray-200 bg-transparent py-2 px-0 text-gray-900 font-medium focus:ring-0 focus:border-[#8B1E1E] transition-colors cursor-pointer appearance-none outline-none"
                value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
              >
                <option value="" disabled className="text-gray-400">Select Term</option>
                {terms.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={fetchReportCard}
                disabled={loading || !selectedStudent || !selectedTerm}
                className="flex-1 relative px-6 py-2.5 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center overflow-hidden disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none bg-gradient-to-r from-[#8B1E1E] to-[#b32727] hover:shadow-lg hover:from-[#7a1a1a] hover:to-[#a02222] hover:-translate-y-0.5"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Get Report"}
              </button>
              {user?.role === "admin" && selectedTerm && (
                <button 
                  onClick={handleToggleLock}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition border shadow-sm disabled:opacity-50 ${terms.find(t => t._id === selectedTerm)?.isLocked ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"}`}
                  title={terms.find(t => t._id === selectedTerm)?.isLocked ? "Unlock Results" : "Lock Results"}
                >
                  {terms.find(t => t._id === selectedTerm)?.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 print:hidden">
            {error}
          </div>
        )}

        {/* Report Card Display */}
        {reportData && (
          <div className="animate-fade-in-up">
            {/* Action Buttons - Hidden from print */}
            <div className="flex justify-end gap-4 mb-4 print:hidden">
              <button 
                onClick={handlePrint}
                className="flex items-center bg-gray-900 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:bg-gray-800 hover:shadow-lg transition-all active:scale-95 border border-gray-700"
              >
                <Printer className="w-5 h-5 mr-2 opacity-80" />
                Print Official PDF
              </button>
            </div>
            
            {/* The actual component */}
            <div className="print-wrapper shadow-2xl rounded-b overflow-hidden border border-gray-200 print:shadow-none print:border-none">
              <PrintableReportCard data={reportData} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportCardView;
