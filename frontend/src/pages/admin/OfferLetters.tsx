import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Search, FileText, Briefcase, Mail, School, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    department?: string;
    presentAddress?: string;
}

interface OfferTemplate {
    _id: string;
    name: string;
    type: string;
    subjectLine: string;
    body: string;
}

const OfferLetters: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [templates, setTemplates] = useState<OfferTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<OfferTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Form Overrides
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        department: '',
        salary: '$0',
        joiningDate: new Date().toISOString().split('T')[0],
        subjectLine: '',
        body: ''
    });

    useEffect(() => {
        // Fetch Templates on Mount
        const fetchTemplates = async () => {
            try {
                const res = await api.get('/offers/templates');
                if (res.data.length === 0) {
                    // Auto-create a default template if none exist globally
                    const payload = {
                        name: "Standard Corporate Admission",
                        type: "student",
                        subjectLine: "Offer of Admission to Firstborn Academy",
                        body: "Dear {{name}},\n\nWe are extremely pleased to formally offer you a position in the {{department}} unit starting {{joiningDate}}.\n\nYour profile has met our rigorous academic frameworks.\n\nYour primary compensation or fee grid is mapped at: {{salary}}.\n\nWe look forward to an astonishing matrix together.\n\nSincerely,"
                    };
                    const createRes = await api.post('/offers/templates', payload);
                    setTemplates([createRes.data]);
                } else {
                    setTemplates(res.data);
                }
            } catch (err) {
                toast.error("Failed to fetch templates");
            }
        };
        fetchTemplates();
    }, []);

    // Search Lookup
    useEffect(() => {
        const fetchResults = async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsLoading(true);
            try {
                // Fetch anyone (role=all ensures we can send teacher or student offers)
                const res = await api.get(`/users/pages?search=${searchTerm}&role=all&limit=8`);
                setSearchResults(res.data.users || []);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSelectUser = (user: UserData) => {
        setSelectedUser(user);
        setSearchTerm('');
        setSearchResults([]);

        let initialBody = '';
        let initialSubject = '';

        if (templates.length > 0) {
            const temp = templates[0];
            setSelectedTemplate(temp);
            initialSubject = temp.subjectLine;
            initialBody = resolvePlaceholders(temp.body, user, undefined);
        }

        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department || 'General Assignments',
            salary: user.role === 'teacher' ? '$85,000 / Year' : 'Fully Funded Scholarship',
            joiningDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // Next month
            subjectLine: initialSubject,
            body: initialBody
        });
        toast.success("User Target Locked.");
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const temp = templates.find(t => t._id === e.target.value);
        if (temp) {
            setSelectedTemplate(temp);
            setFormData(prev => ({
                ...prev,
                subjectLine: temp.subjectLine,
                body: resolvePlaceholders(temp.body, selectedUser, prev)
            }));
        }
    };

    const resolvePlaceholders = (text: string, user: UserData | null, currentForm?: any) => {
        if (!text) return '';
        let output = text;
        output = output.replace(/{{name}}/g, user?.name || currentForm?.name || '[NAME]');
        output = output.replace(/{{department}}/g, user?.department || currentForm?.department || '[DEPARTMENT]');
        output = output.replace(/{{salary}}/g, currentForm?.salary || '[COMPENSATION]');
        output = output.replace(/{{course}}/g, user?.department || '[COURSE]');
        output = output.replace(/{{joiningDate}}/g, currentForm?.joiningDate || '[DATE]');
        output = output.replace(/{{role}}/g, user?.role || '[ROLE]');
        return output;
    };

    // Re-resolve body if salary or department changes manually
    const updateFormField = (field: string, value: string) => {
        setFormData(prev => {
            const nextForm = { ...prev, [field]: value };
            if (field !== 'body' && selectedTemplate) {
                nextForm.body = resolvePlaceholders(selectedTemplate.body, selectedUser, nextForm);
            }
            return nextForm;
        });
    };

    // Generate AI Method
    const handleGenerateAI = async () => {
        setIsGeneratingAI(true);
        toast.loading("Invoking Gemini-1.5 AI Pipeline for Corporate Analysis...");
        try {
            const res = await api.post('/offers/generate-ai', {
                name: formData.name,
                role: formData.role,
                department: formData.department,
                salary: formData.salary,
                joiningDate: formData.joiningDate
            });
            setFormData(prev => ({ ...prev, body: res.data.text }));
            toast.dismiss();
            toast.success("AI Synthesis Complete.");
        } catch (err: any) {
            console.error("AI Error:", err);
            toast.dismiss();
            toast.error(err.response?.data?.message || "Failed to communicate with AI core.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Generate PDF Instance
    const generatePdfInstance = async (): Promise<jsPDF | null> => {
        const node = document.getElementById('printable-a4-letter');
        if (!node) return null;
        try {
            // Temporarily remove any transforms or clipping bounds to assist html2canvas
            const canvas = await html2canvas(node, { scale: 2, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/png');
            // A4 dimensions: 210mm x 297mm
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [210, 297] });
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            return pdf;
        } catch (error) {
            console.error("PDF generation failed:", error);
            return null;
        }
    };

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        toast.loading("Compiling High-Res A4 Matrix...");
        const pdf = await generatePdfInstance();
        if (pdf) {
            pdf.save(`Offer_Letter_${(formData.name || 'Candidate').replace(/\s+/g, '_')}.pdf`);
            toast.dismiss();
            toast.success("PDF Downloaded.");
        } else {
            toast.dismiss();
            toast.error("Failed to generate PDF.");
        }
        setIsExporting(false);
    };

    const handleSendEmail = async () => {
        if (!selectedUser) {
            toast.error("Please lock a user target first.");
            return;
        }
        setIsExporting(true);
        toast.loading("Generating Vector Nodes and Dispatching over SMTP...");

        const pdf = await generatePdfInstance();
        if (!pdf) {
            toast.dismiss();
            toast.error("Failed to compile Letter Vectors.");
            setIsExporting(false);
            return;
        }

        const pdfBase64 = pdf.output('datauristring');

        try {
            const res = await api.post('/offers/send', {
                recipientEmail: formData.email,
                recipientName: formData.name,
                userId: selectedUser._id,
                templateId: selectedTemplate?._id,
                pdfBase64,
                subjectLine: formData.subjectLine,
                bodyMessage: `<p>Please find your enclosed offer letter digitally attached to this transmission.</p>`
            });

            toast.dismiss();
            if (res.data.warning) {
                toast.success(res.data.message);
                toast.message("Reference Log Saved: " + res.data.referenceNumber);
            } else {
                toast.success("Email Dispatched Automatically!");
            }

        } catch (err: any) {
            toast.dismiss();
            toast.error(err.response?.data?.message || 'Failed to dispatch email.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-6 lg:p-10 flex flex-col xl:flex-row gap-8">

            {/* Left Panel: Configuration Logic */}
            <div className="w-full xl:w-[400px] shrink-0 space-y-6">

                <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none"></div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center mb-6 z-10 relative">
                        <Briefcase className="w-6 h-6 mr-3 text-indigo-500" /> Dispatcher
                    </h2>

                    {/* User Search */}
                    <div className="relative z-10 mb-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Lookup</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Query Name or Email..."
                                className="w-full bg-gray-50 dark:bg-[#121212] border-2 border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:border-indigo-500 outline-none transition"
                            />
                            {isLoading && <span className="absolute right-4 top-3.5 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>}
                        </div>
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#232323] border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl overflow-hidden z-[100]">
                                {searchResults.map(s => (
                                    <button
                                        key={s._id}
                                        onClick={() => handleSelectUser(s)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#333] border-b border-gray-100 dark:border-gray-800 last:border-0"
                                    >
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{s.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{s.email} • {s.role}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedUser && (
                        <div className="space-y-4 relative z-10 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Offer Blueprint</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-[#121212] py-3 px-4 rounded-xl text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none appearance-none"
                                    value={selectedTemplate?._id || ''}
                                    onChange={handleTemplateChange}
                                >
                                    {templates.map(t => <option key={t._id} value={t._id}>{t.name} ({t.type})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Name</label>
                                    <input type="text" value={formData.name} onChange={e => updateFormField('name', e.target.value)} className="w-full bg-gray-50 dark:bg-[#121212] rounded-lg p-2 text-sm border focus:border-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Email</label>
                                    <input type="email" value={formData.email} onChange={e => updateFormField('email', e.target.value)} className="w-full bg-gray-50 dark:bg-[#121212] rounded-lg p-2 text-sm border focus:border-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Joining Date</label>
                                    <input type="date" value={formData.joiningDate} onChange={e => updateFormField('joiningDate', e.target.value)} className="w-full bg-gray-50 dark:bg-[#121212] rounded-lg p-2 text-sm border focus:border-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Compensation</label>
                                    <input type="text" value={formData.salary} onChange={e => updateFormField('salary', e.target.value)} className="w-full bg-gray-50 dark:bg-[#121212] rounded-lg p-2 text-sm border focus:border-indigo-500 outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Department</label>
                                    <input type="text" value={formData.department} onChange={e => updateFormField('department', e.target.value)} className="w-full bg-gray-50 dark:bg-[#121212] rounded-lg p-2 text-sm border focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {selectedUser && (
                    <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subject Header</label>
                            <input type="text" value={formData.subjectLine} onChange={e => updateFormField('subjectLine', e.target.value)} className="w-full bg-gray-50 dark:bg-[#121212] rounded-xl p-3 text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Live Interpolation Editor</label>
                                <button
                                    onClick={handleGenerateAI}
                                    disabled={isGeneratingAI || !selectedUser}
                                    className="flex items-center text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                                >
                                    {isGeneratingAI ? <span className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                                    AI Generate Magic
                                </button>
                            </div>
                            <textarea rows={10} value={formData.body} onChange={e => updateFormField('body', e.target.value)} className="w-full bg-gray-50 dark:bg-[#121212] rounded-xl p-4 text-sm font-medium border-2 border-transparent focus:border-indigo-500 outline-none font-serif leading-relaxed custom-scrollbar" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button onClick={handleDownloadPDF} disabled={isExporting} className="bg-gray-100 hover:bg-gray-200 dark:bg-[#2a2a2a] dark:hover:bg-[#333] text-gray-900 dark:text-white rounded-xl py-3 font-bold flex justify-center items-center transition">
                                <FileText className="w-4 h-4 mr-2" /> PDF Node
                            </button>
                            <button onClick={handleSendEmail} disabled={isExporting} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-bold flex justify-center items-center transition relative overflow-hidden group">
                                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Deploy Email
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: Exact A4 Live Render Canvas */}
            <div className="flex-1 overflow-y-auto flex items-start justify-center pt-10 pb-10 custom-scrollbar">

                {!selectedUser && (
                    <div className="flex flex-col items-center justify-center opacity-30 mt-32">
                        <FileText className="w-24 h-24 mb-6" />
                        <p className="text-xl font-bold tracking-widest uppercase">Waiting for A4 Signal</p>
                    </div>
                )}

                {selectedUser && (
                    <div className="relative group shrink-0 origin-top shadow-2xl transition-transform">

                        {/* THE 1:1 EXACT A4 PHYSICAL NODE (794px by 1123px => 210mm x 297mm at 96PPI) */}
                        <div
                            id="printable-a4-letter"
                            className="bg-white text-black shrink-0 relative flex flex-col items-center px-[80px] py-[100px]"
                            style={{
                                width: '794px',
                                height: '1123px',
                                fontFamily: "'Times New Roman', serif"
                            }}
                        >
                            {/* Corporate Header */}
                            <div className="w-full flex justify-between items-start border-b-[3px] border-[#0f172a] pb-8 mb-10">
                                <div className="flex items-center space-x-4">
                                    <div className="w-[60px] h-[60px] bg-[#0f172a] rounded flex items-center justify-center">
                                        <School className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-[28px] font-black tracking-tight text-[#0f172a] uppercase leading-none mb-1">FIRSTBORN ACADEMY</h1>
                                        <p className="text-[12px] font-sans font-bold text-gray-500 uppercase tracking-widest">Office of The Chancellor</p>
                                    </div>
                                </div>
                                <div className="text-right font-sans text-[11px] text-gray-500 space-y-1">
                                    <p>123 Corporate Campus Blvd</p>
                                    <p>Tech Sector 4, Silicon Valley, CA 90210</p>
                                    <p className="font-bold text-[#0f172a] mt-2">admissions@firstborn.edu</p>
                                </div>
                            </div>

                            {/* Letter Metadata & Subject */}
                            <div className="w-full flex justify-between items-end mb-10">
                                <div className="space-y-1">
                                    <p className="text-[14px]"><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-[14px]"><strong>To:</strong> {formData.name}</p>
                                    <p className="text-[14px]"><strong>Email:</strong> {formData.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-[12px] bg-gray-100 px-3 py-1 border border-gray-300">REF: {selectedUser._id.substring(0, 10).toUpperCase()}-OFR</p>
                                </div>
                            </div>

                            <div className="w-full text-center mb-8">
                                <h2 className="text-[18px] font-bold uppercase underline decoration-2 underline-offset-4 tracking-wider">Subject: {formData.subjectLine || 'Official Offer Notice'}</h2>
                            </div>

                            {/* Body Interpolation */}
                            <div className="w-full flex-1 text-[15px] leading-[1.8] text-gray-900 text-justify mb-10 whitespace-pre-line">
                                {formData.body}
                            </div>

                            {/* Signatures */}
                            <div className="w-full flex justify-start items-end mb-8 relative">
                                <div className="space-y-4 text-center">
                                    <div className="font-['Brush_Script_MT',cursive] text-[42px] text-blue-900 leading-none -rotate-2">
                                        J. Chancellor
                                    </div>
                                    <div className="w-[200px] h-[1px] bg-black"></div>
                                    <div className="text-left font-sans">
                                        <p className="font-bold text-[14px]">Jonathan Chancellor</p>
                                        <p className="text-[12px] text-gray-600 uppercase tracking-widest">Executive Director, Human Resources</p>
                                        <p className="text-[12px] text-gray-600">Firstborn Operations Matrix</p>
                                    </div>
                                </div>

                                {/* Official Secure Seal Mockup */}
                                <div className="absolute right-10 bottom-10 w-[120px] h-[120px] rounded-full border-[2px] border-red-800/20 flex items-center justify-center p-2 opacity-50 rotate-12">
                                    <div className="w-full h-full rounded-full border border-dashed border-red-800/40 flex items-center justify-center text-red-800 text-[10px] font-bold tracking-[0.3em] uppercase text-center leading-tight shadow-sm">
                                        Official Document Approved
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="w-full mt-auto pt-6 border-t border-gray-200 text-center font-sans space-y-1 pb-4">
                                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">This letter constitutes a formal structural dispatch generated by system logic.</p>
                                <p className="text-[10px] text-gray-400">Strictly Confidential. Do not distribute without clearance parameters.</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
};

export default OfferLetters;
