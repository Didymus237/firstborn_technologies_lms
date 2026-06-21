import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import PrintableReportCard from "@/components/reportCard/PrintableReportCard";
import type { ReportCardData } from "@/components/reportCard/PrintableReportCard";
import { Printer } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";

const MyReportCard: React.FC = () => {
  const { user } = useAuth();
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch terms
    api.get("/exam-terms")
      .then((res) => setTerms(res.data.terms || []))
      .catch((err) => console.error("Error fetching terms", err));
  }, []);

  const fetchReportCard = async () => {
    if (!selectedTerm || !user) return;
    setLoading(true);
    setError("");
    setReportData(null);
    try {
      const res = await api.get(`/report-cards/${user._id}/${selectedTerm}`);
      setReportData(res.data.reportCard);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load report card. Your results may not be published yet or you missed the exam.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Controls Section - Hidden from printing */}
        <div className="bg-white shadow rounded-lg p-6 mb-8 print:hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            My Academic Reports
          </h2>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam Term</label>
              <select 
                className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500"
                value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
              >
                <option value="">-- Choose Term --</option>
                {terms.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            
            <button 
              onClick={fetchReportCard}
              disabled={loading || !selectedTerm}
              className="bg-indigo-600 text-white font-bold py-2 px-8 rounded hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Get My Report"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 print:hidden">
            {error}
          </div>
        )}

        {reportData && (
          <div className="animate-fade-in-up">
            <div className="flex justify-end gap-4 mb-4 print:hidden">
              <button 
                onClick={handlePrint}
                className="flex items-center bg-gray-800 text-white font-semibold py-2 px-6 rounded-md shadow hover:bg-gray-700 transition"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print PDF
              </button>
            </div>
            
            <div className="print-wrapper shadow-2xl rounded-b overflow-hidden border border-gray-200 print:shadow-none print:border-none">
              <PrintableReportCard data={reportData} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyReportCard;
