import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

const MarksEntry: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [marks, setMarks] = useState<{ [key: string]: { obtained: number; max: number; remarks: string } }>({});
  const [loading, setLoading] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  useEffect(() => {
    // Fetch initial dropdown data: Classes, Terms, Subjects
    const fetchSelectData = async () => {
      try {
        const [clsRes, termRes, subRes] = await Promise.all([
          api.get("/classes"),
          api.get("/exam-terms"),
          api.get("/subjects"),
        ]);
        setClasses(clsRes.data.data || []);
        setTerms(termRes.data.terms || []);
        setSubjects(subRes.data || []);
      } catch (err) {
        console.error("Error fetching dropdown data", err);
      }
    };
    fetchSelectData();
  }, []);

  useEffect(() => {
    // Fetch students when a class is selected
    if (selectedClass) {
      api.get(`/classes/${selectedClass}`)
        .then((res) => {
          setStudents(res.data.students || []);
        })
        .catch(console.error);
    }
  }, [selectedClass]);

  const handleMarkChange = (studentId: string, field: "obtained" | "max" | "remarks", value: any) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        max: prev[studentId]?.max || 100 // default max
      }
    }));
  };

  const submitMarks = async () => {
    if (Object.keys(marks).length === 0) {
      alert("Please enter at least one mark before saving.");
      return;
    }
    setLoading(true);
    setIsSubmitSuccess(false);
    try {
      const promises = Object.keys(marks).map((studentId) => {
        const payload = {
          student: studentId,
          classId: selectedClass,
          examTerm: selectedTerm,
          subject: selectedSubject,
          maxMarks: marks[studentId].max,
          obtainedMarks: marks[studentId].obtained,
          remarks: marks[studentId].remarks,
        };
        return api.post("/report-cards/marks", payload);
      });

      await Promise.all(promises);
      setIsSubmitSuccess(true);
      
      // Auto-generate report card to update aggregates
      await Promise.all(Object.keys(marks).map(studentId => 
        api.post("/report-cards/generate", {
          student: studentId,
          classId: selectedClass,
          examTerm: selectedTerm
        })
      ));

    } catch (err) {
      console.error("Error submitting marks", err);
      alert("Failed to save marks.");
    } finally {
      setLoading(false);
    }
  };

  const activeTerm = terms.find((t) => t._id === selectedTerm);
  const isTermLocked = activeTerm?.isLocked || false;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8 p-8 bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B1E1E] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Exam Marks Entry</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">Academic evaluations & grading portal</p>
          </div>
        </div>
      </div>

      {/* Selectors Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center transition-all hover:shadow-[0_4px_15px_-3px_rgba(6,81,237,0.15)] group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#8B1E1E]/20 group-hover:bg-[#8B1E1E] transition-colors"></div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Class</label>
          <select 
            className="w-full border-0 border-b-2 border-gray-200 bg-transparent py-2 px-0 text-gray-900 font-medium focus:ring-0 focus:border-[#8B1E1E] transition-colors cursor-pointer appearance-none outline-none"
            value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="" disabled className="text-gray-400">Choose a class...</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center transition-all hover:shadow-[0_4px_15px_-3px_rgba(6,81,237,0.15)] group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#8B1E1E]/20 group-hover:bg-[#8B1E1E] transition-colors"></div>
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Exam Term</label>
           <select 
            className="w-full border-0 border-b-2 border-gray-200 bg-transparent py-2 px-0 text-gray-900 font-medium focus:ring-0 focus:border-[#8B1E1E] transition-colors cursor-pointer appearance-none outline-none"
            value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="" disabled className="text-gray-400">Choose a term...</option>
            {terms.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex flex-col justify-center transition-all hover:shadow-[0_4px_15px_-3px_rgba(6,81,237,0.15)] group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#8B1E1E]/20 group-hover:bg-[#8B1E1E] transition-colors"></div>
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Subject</label>
           <select 
            className="w-full border-0 border-b-2 border-gray-200 bg-transparent py-2 px-0 text-gray-900 font-medium focus:ring-0 focus:border-[#8B1E1E] transition-colors cursor-pointer appearance-none outline-none"
            value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="" disabled className="text-gray-400">Choose a subject...</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
      </div>

      {!selectedClass || !selectedTerm || !selectedSubject ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
             </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Awaiting Selection</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm text-center">Please select a Class, Term, and Subject from the menus above to begin entering marks.</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
             <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Students Found</h3>
          <p className="text-sm text-gray-500 mt-1">There are currently no students assigned to this class.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 ring-1 ring-black/5">
          {isTermLocked && (
            <div className="bg-rose-50 text-rose-700 font-medium px-6 py-4 border-b border-rose-100 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              This exam term is officially locked. Marks are read-only and cannot be altered.
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest bg-gray-50 sticky left-0 z-10 w-1/3">Student Details</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-widest bg-gray-50">Max Marks</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#8B1E1E] uppercase tracking-widest bg-rose-50/30">Obtained</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest bg-gray-50 w-1/3">Remarks/Comments</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {students.map((student, idx) => (
                  <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap sticky left-0 z-10 bg-white group-hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                           <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm">
                             {student.name.charAt(0)}
                           </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">ID: {student.rollNumber || student._id.substring(0,8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                        <input 
                          type="number" 
                          className="w-20 bg-gray-50 border border-gray-200 rounded-md p-2 text-center text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] disabled:opacity-60 transition-all font-mono" 
                          defaultValue={100}
                          onChange={(e) => handleMarkChange(student._id, "max", Number(e.target.value))}
                          disabled={isTermLocked}
                        />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center bg-rose-50/10">
                      <input 
                        type="number" 
                        className="w-24 bg-white border border-gray-300 rounded-lg p-2.5 text-center font-bold text-lg text-[#8B1E1E] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/40 focus:border-[#8B1E1E] placeholder-gray-300 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                        placeholder="--"
                        onChange={(e) => handleMarkChange(student._id, "obtained", Number(e.target.value))}
                        disabled={isTermLocked}
                      />
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <input 
                        type="text" 
                        className="w-full bg-transparent border-0 border-b border-gray-200 px-2 py-2 text-sm text-gray-700 focus:outline-none focus:ring-0 focus:border-[#8B1E1E] placeholder-gray-400 disabled:opacity-60 transition-all"
                        placeholder="Add observation..."
                        onChange={(e) => handleMarkChange(student._id, "remarks", e.target.value)}
                        disabled={isTermLocked}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-gray-50/80 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
            <div className="text-sm text-gray-500 italic">
              * Ensure all entries are double-checked before saving.
            </div>
            <div className="flex items-center space-x-4">
              {isSubmitSuccess && (
                <span className="text-emerald-600 font-medium flex items-center bg-emerald-50 px-3 py-1 rounded-full text-sm border border-emerald-100">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Records Successfully Saved
                </span>
              )}
              <button 
                onClick={submitMarks}
                disabled={loading || isTermLocked}
                className={`relative px-8 py-2.5 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center overflow-hidden ${(loading || isTermLocked) ? "bg-gray-400 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-[#8B1E1E] to-[#b32727] hover:shadow-lg hover:from-[#7a1a1a] hover:to-[#a02222] hover:-translate-y-0.5 active:translate-y-0"}`}
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isTermLocked ? "Results Locked" : loading ? "Committing..." : "Save Academic Records"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
