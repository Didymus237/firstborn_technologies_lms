import React, { useState, useEffect, useRef } from 'react';
import { api, baseURL } from '@/lib/api';
import { Search, Printer, School, Phone, MapPin, Edit3, Image as ImageIcon, Download, ShieldCheck, CheckCircle2, UserCheck, GraduationCap, Calendar, Mail, FileText, Loader2, UploadCloud, X, HelpCircle } from 'lucide-react';
import ReactQRCode from 'react-qr-code';
const QRCode: any = (ReactQRCode as any).default || (ReactQRCode as any).QRCode || ReactQRCode;
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

const resolvePhotoUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
};

interface StudentData {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    enrollmentNumber?: string;
    fatherName?: string;
    dob?: string;
    department?: string;
    courseDuration?: string;
    presentAddress?: string;
    permanentAddress?: string;
    photoUrl?: string;
    studentClass?: {
        name: string;
    };
}

const StudentIdPrinter: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<StudentData[]>([]);
    const [defaultStudents, setDefaultStudents] = useState<StudentData[]>([]);
    const [student, setStudent] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [activeTab, setActiveTab] = useState<'search' | 'edit' | 'export'>('search');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // 1. Fetch Top 20 Students on mount
    const fetchDefaultStudents = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/users/pages?role=student&limit=20`);
            setDefaultStudents(res.data.users || []);
        } catch (err) {
            console.error("Failed to load registry matrix", err);
            toast.error("Failed to load initial student matrix");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDefaultStudents();
    }, []);

    // 2. Debounced Search via AJAX
    useEffect(() => {
        const fetchResults = async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const res = await api.get(`/users/pages?search=${searchTerm}&role=student&limit=10`);
                setSearchResults(res.data.users || []);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSelectStudent = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await api.get(`/users/enrollment/${id}`);
            setStudent(res.data);
            setActiveTab('edit');
            setSearchResults([]);
            setSearchTerm('');
            toast.success("Student loaded securely.");
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch student profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && student) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File is too large. Maximum size is 2MB.");
                return;
            }
            
            setIsUploading(true);
            const toastId = toast.loading("Uploading student photo...");
            try {
                const formData = new FormData();
                formData.append("image", file);
                const res = await api.post("/upload/profile-picture", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (res.data && res.data.url) {
                    setStudent({ ...student, photoUrl: res.data.url });
                    toast.success("Photo uploaded successfully!");
                } else {
                    toast.error("Upload response missing URL.");
                }
            } catch (err: any) {
                console.error("Upload error", err);
                toast.error(err.response?.data?.message || "Failed to upload image.");
            } finally {
                setIsUploading(false);
                toast.dismiss(toastId);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        setIsSaving(true);
        try {
            await api.patch(`/users/update/${student._id}`, {
                name: student.name,
                email: student.email,
                phone: student.phone,
                enrollmentNumber: student.enrollmentNumber,
                fatherName: student.fatherName,
                dob: student.dob,
                department: student.department,
                courseDuration: student.courseDuration,
                presentAddress: student.presentAddress,
                permanentAddress: student.permanentAddress,
                photoUrl: student.photoUrl
            });
            toast.success("Identity Matrix Updated.");
            // Refresh
            handleSelectStudent(student._id);
            // Refresh registry
            fetchDefaultStudents();
        } catch (err) {
            toast.error("Failed to commit updates.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPNG = async () => {
        const node = document.getElementById('printable-business-card');
        if (!node) return;
        setIsExporting(true);
        const toastId = toast.loading("Generating High-Res PNG...");
        try {
            const canvas = await html2canvas(node, { scale: 3, useCORS: true });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `ID_${student?.enrollmentNumber || student?._id}.png`;
            link.href = url;
            link.click();
            toast.dismiss(toastId);
            toast.success("PNG Exported successfully.");
        } catch (err) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error("Export Failed.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadPDF = async () => {
        const node = document.getElementById('printable-business-card');
        if (!node) return;
        setIsExporting(true);
        const toastId = toast.loading("Compiling Print-Ready PDF...");
        try {
            const canvas = await html2canvas(node, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            // Business Card size in mm: 88.9 x 50.8
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [88.9, 50.8]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 88.9, 50.8);
            pdf.save(`ID_${student?.enrollmentNumber || student?._id}.pdf`);
            toast.dismiss(toastId);
            toast.success("PDF Exported successfully.");
        } catch (err) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error("Export Failed.");
        } finally {
            setIsExporting(false);
        }
    };

    // Determine current displayed list: Search results or top 20 default
    const activeRegistryList = searchTerm.length >= 2 ? searchResults : defaultStudents;

    return (
        <div className="min-h-screen bg-[#FCFCFC] dark:bg-[#121212] p-4 md:p-8 print:p-0 print:bg-white print:m-0 font-sans antialiased overflow-x-hidden">
            
            {/* Blurred background accents for premium classy tone */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B1E1E]/3 blur-[120px] rounded-full pointer-events-none print:hidden" />
            <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-[#C5A03A]/3 blur-[100px] rounded-full pointer-events-none print:hidden" />

            {/* --- NON-PRINTABLE DASHBOARD UI --- */}
            <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-8 print:hidden relative z-10">

                {/* Left Panel: Print Engine Dashboard */}
                <div className="w-full xl:w-[420px] bg-white/70 dark:bg-zinc-900/75 backdrop-blur-xl rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col max-h-[850px] shrink-0">

                    {/* Header */}
                    <div className="p-6 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8B1E1E] to-[#C5A03A]" />
                        <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2.5">
                            <ShieldCheck className="w-5 h-5 text-[#8B1E1E] dark:text-[#E27676]" />
                            Secure Print Engine
                        </h1>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">Verify credentials & generate high-resolution print vectors</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-950/5 p-1 gap-1">
                        <button 
                            onClick={() => setActiveTab('search')} 
                            className={`flex-1 py-3 text-xs font-bold rounded-xl flex justify-center items-center transition-all ${activeTab === 'search' ? 'bg-[#8B1E1E]/5 text-[#8B1E1E] dark:bg-[#8B1E1E]/15 dark:text-[#E27676]' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Search className="w-4 h-4 mr-2" /> Search Registry
                        </button>
                        <button 
                            disabled={!student} 
                            onClick={() => setActiveTab('edit')} 
                            className={`flex-1 py-3 text-xs font-bold rounded-xl flex justify-center items-center transition-all disabled:opacity-30 ${activeTab === 'edit' ? 'bg-[#8B1E1E]/5 text-[#8B1E1E] dark:bg-[#8B1E1E]/15 dark:text-[#E27676]' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Edit3 className="w-4 h-4 mr-2" /> Live Details
                        </button>
                        <button 
                            disabled={!student} 
                            onClick={() => setActiveTab('export')} 
                            className={`flex-1 py-3 text-xs font-bold rounded-xl flex justify-center items-center transition-all disabled:opacity-30 ${activeTab === 'export' ? 'bg-[#8B1E1E]/5 text-[#8B1E1E] dark:bg-[#8B1E1E]/15 dark:text-[#E27676]' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Download className="w-4 h-4 mr-2" /> Export
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">

                        {/* SEARCH TAB */}
                        {activeTab === 'search' && (
                            <div className="space-y-6">
                                {/* Search input query */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80">
                                        Identity Tracking Query
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
                                        <input
                                            // eslint-disable-next-line jsx-a11y/no-autofocus
                                            autoFocus
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Enter student name, ID or code..."
                                            className="w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-foreground outline-none focus:border-[#8B1E1E] dark:focus:border-[#8B1E1E] focus:ring-2 focus:ring-[#8B1E1E]/10 transition-all font-semibold placeholder:text-muted-foreground/60"
                                        />
                                        {isLoading && (
                                            <span className="absolute right-4 top-3.5 w-4.5 h-4.5 border-2 border-[#8B1E1E] border-t-transparent rounded-full animate-spin"></span>
                                        )}
                                    </div>
                                </div>

                                {/* Active registry header */}
                                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                                        {searchTerm.length >= 2 ? `Search Matches (${searchResults.length})` : "Top 20 Active Students"}
                                    </span>
                                </div>

                                {/* Scrollable list of students */}
                                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                    {activeRegistryList.map(s => (
                                        <button
                                            key={s._id}
                                            onClick={() => handleSelectStudent(s._id)}
                                            className={`w-full text-left p-3.5 border rounded-2xl hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all flex items-center justify-between group ${student?._id === s._id ? 'border-[#8B1E1E]/50 bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/10' : 'border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40'}`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <img 
                                                    src={s.photoUrl ? resolvePhotoUrl(s.photoUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`} 
                                                    alt={s.name} 
                                                    className="w-10 h-10 rounded-full bg-zinc-100 object-cover border border-zinc-200 dark:border-zinc-800" 
                                                />
                                                <div>
                                                    <p className="font-bold text-sm text-foreground group-hover:text-[#8B1E1E] transition-colors">{s.name}</p>
                                                    <p className="text-[10px] font-bold font-mono text-muted-foreground mt-0.5">{s.enrollmentNumber || 'NO ENROLLMENT ID'}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800/80 text-foreground border border-zinc-200/50 dark:border-zinc-700/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                {s.studentClass?.name || 'Class N/A'}
                                            </span>
                                        </button>
                                    ))}
                                    {activeRegistryList.length === 0 && !isLoading && (
                                        <div className="text-center py-8 text-muted-foreground text-sm font-medium">No students matches found.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* EDIT TAB */}
                        {activeTab === 'edit' && student && (
                            <form onSubmit={handleUpdateStudent} className="space-y-4">
                                <div className="flex justify-center mb-2">
                                    <div 
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        className={`relative group ${isUploading ? 'pointer-events-none' : 'cursor-pointer'}`}
                                    >
                                        <img 
                                            src={resolvePhotoUrl(student.photoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}`} 
                                            alt="" 
                                            className="w-20 h-20 rounded-full bg-zinc-100 border-2 border-[#C5A03A]/30 shadow-md object-cover" 
                                        />
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <UploadCloud className="w-5 h-5 text-white" />
                                        </div>
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-[#C5A03A]" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3.5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                            Student Photograph
                                        </label>
                                        
                                        {/* Visual Direct Upload Box */}
                                        <div 
                                            onClick={() => !isUploading && fileInputRef.current?.click()}
                                            className={`group border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-[#8B1E1E]/50 dark:hover:border-[#8B1E1E]/50 rounded-xl p-3 flex items-center gap-3 bg-zinc-50/30 dark:bg-zinc-950/20 hover:bg-[#8B1E1E]/5 transition-all duration-300 relative ${isUploading ? 'pointer-events-none opacity-80' : 'cursor-pointer'}`}
                                        >
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleFileUpload} 
                                                accept="image/png, image/jpeg, image/jpg" 
                                                className="hidden" 
                                            />
                                            <div className="w-10 h-10 rounded-lg bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/15 text-[#8B1E1E] dark:text-[#E27676] flex items-center justify-center group-hover:scale-95 transition-transform duration-300">
                                                {isUploading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <UploadCloud className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-foreground">Click to upload photo directly</p>
                                                <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">Supports JPG, JPEG, PNG (Max 2MB)</p>
                                            </div>
                                        </div>

                                        {/* Collapsible manual link field */}
                                        <div className="mt-2.5">
                                            <details className="group/details">
                                                <summary className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer list-none flex items-center gap-1 hover:text-foreground transition-colors select-none">
                                                    <span className="transition-transform group-open/details:rotate-90">▶</span>
                                                    <span>Or use external image URL</span>
                                                </summary>
                                                <div className="mt-1.5 pl-3 border-l-2 border-zinc-100 dark:border-zinc-800">
                                                    <input 
                                                        type="text" 
                                                        value={student.photoUrl || ''} 
                                                        onChange={(e) => setStudent({ ...student, photoUrl: e.target.value })} 
                                                        className="w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-2.5 text-[11px] focus:border-[#8B1E1E] outline-none font-medium" 
                                                        placeholder="Paste image URL (e.g. https://example.com/photo.jpg)" 
                                                    />
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Legal Name</label>
                                        <input type="text" value={student.name || ''} onChange={(e) => setStudent({ ...student, name: e.target.value })} className="mt-1 w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:border-[#8B1E1E] outline-none font-bold" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enrollment ID</label>
                                            <input type="text" value={student.enrollmentNumber || ''} onChange={(e) => setStudent({ ...student, enrollmentNumber: e.target.value })} className="mt-1 w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs font-mono focus:border-[#8B1E1E] outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                                            <input type="text" value={student.department || ''} onChange={(e) => setStudent({ ...student, department: e.target.value })} className="mt-1 w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:border-[#8B1E1E] outline-none font-bold text-[#8B1E1E] dark:text-[#E27676]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Father's Name</label>
                                            <input type="text" value={student.fatherName || ''} onChange={(e) => setStudent({ ...student, fatherName: e.target.value })} className="mt-1 w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:border-[#8B1E1E] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date of Birth</label>
                                            <input type="date" value={student.dob ? new Date(student.dob).toISOString().split('T')[0] : ''} onChange={(e) => setStudent({ ...student, dob: e.target.value })} className="mt-1 w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:border-[#8B1E1E] outline-none font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Course Cohort</label>
                                            <input type="text" value={student.courseDuration || ''} onChange={(e) => setStudent({ ...student, courseDuration: e.target.value })} className="mt-1 w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:border-[#8B1E1E] outline-none" placeholder="e.g. 2024-2028" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</label>
                                            <input type="text" value={student.phone || ''} onChange={(e) => setStudent({ ...student, phone: e.target.value })} className="mt-1 w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs font-mono focus:border-[#8B1E1E] outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Present Address</label>
                                        <textarea rows={2} value={student.presentAddress || ''} onChange={(e) => setStudent({ ...student, presentAddress: e.target.value })} className="mt-1 w-full bg-[#F5F5F7]/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2 px-3 text-xs focus:border-[#8B1E1E] outline-none font-semibold" />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSaving} 
                                    className="w-full bg-[#8B1E1E] hover:bg-[#8B1E1E]/95 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center disabled:opacity-50 mt-4 shadow-md shadow-[#8B1E1E]/10"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : (
                                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Sync Identity Payload</>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* EXPORT TAB */}
                        {activeTab === 'export' && student && (
                            <div className="space-y-4">
                                <div className="p-4 bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/10 border border-[#8B1E1E]/20 rounded-2xl mb-6 flex items-start">
                                    <ShieldCheck className="w-5 h-5 text-[#8B1E1E] dark:text-[#E27676] flex-shrink-0 mt-0.5 mr-3" />
                                    <p className="text-xs font-semibold text-[#8B1E1E]/90 dark:text-[#E27676] leading-relaxed">
                                        Holographic overlays, ISO 9001:2015 certification metadata, and SVG bounds have been compiled. Ready for physical printing or graphic export.
                                    </p>
                                </div>

                                <button 
                                    onClick={handlePrint} 
                                    className="w-full bg-foreground text-background py-3.5 rounded-xl font-bold flex items-center justify-center hover:opacity-95 transition-all duration-300 shadow-md flex-row gap-2"
                                >
                                    <Printer className="w-4.5 h-4.5" />
                                    <span>Print ID Card</span>
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={handleDownloadPNG} 
                                        disabled={isExporting} 
                                        className="bg-white/70 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground py-3.5 rounded-xl font-bold flex flex-col items-center justify-center transition disabled:opacity-50 border border-zinc-200 dark:border-zinc-800 text-xs gap-1.5 shadow-xs"
                                    >
                                        <ImageIcon className="w-5 h-5 text-[#C5A03A]" />
                                        <span>Download PNG</span>
                                    </button>

                                    <button 
                                        onClick={handleDownloadPDF} 
                                        disabled={isExporting} 
                                        className="bg-white/70 dark:bg-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground py-3.5 rounded-xl font-bold flex flex-col items-center justify-center transition disabled:opacity-50 border border-zinc-200 dark:border-zinc-800 text-xs gap-1.5 shadow-xs"
                                    >
                                        <Download className="w-5 h-5 text-[#8B1E1E] dark:text-[#E27676]" />
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Live Virtual Preview Canvas */}
                <div className="w-full xl:w-2/3 bg-zinc-100 dark:bg-[#0c0c0c] rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative shadow-inner min-h-[500px] xl:min-h-0">
                    {!student && (
                        <div className="flex flex-col items-center text-center max-w-2xl px-4 py-8 space-y-8">
                            <div className="flex flex-col items-center space-y-3">
                                <div className="p-4 rounded-full bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/10 text-[#8B1E1E] animate-pulse">
                                    <GraduationCap className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-foreground text-lg tracking-tight">Student Identity Vector Canvas</h3>
                                    <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1.5 leading-relaxed">
                                        Choose a student from the registry or search on the left to preview, modify details, and print/export official ID cards.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Step-by-Step Flow Chart */}
                            <div className="w-full border-t border-zinc-200/50 dark:border-zinc-800/50 pt-8">
                                <h4 className="text-[10px] font-extrabold text-foreground uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-[#C5A03A]" /> ID Card Print & Generation Workflow
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div className="flex gap-3 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:border-[#8B1E1E]/20 transition-all duration-300">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/15 text-[#8B1E1E] dark:text-[#E27676] font-black text-xs flex items-center justify-center">
                                            01
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wide">Registry Lookup</h5>
                                            <p className="text-[10.5px] text-muted-foreground/90 mt-1 leading-relaxed">
                                                Search by name, program, or enrollment number. The panel displays active matches or defaults to the top 20 active students.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:border-[#8B1E1E]/20 transition-all duration-300">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/15 text-[#8B1E1E] dark:text-[#E27676] font-black text-xs flex items-center justify-center">
                                            02
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wide">Upload Photo Directly</h5>
                                            <p className="text-[10.5px] text-muted-foreground/90 mt-1 leading-relaxed">
                                                Click the avatar or dropzone under <strong>Live Details</strong> to upload JPG/PNG images instantly. The photo syncs straight to the canvas.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:border-[#8B1E1E]/20 transition-all duration-300">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/15 text-[#8B1E1E] dark:text-[#E27676] font-black text-xs flex items-center justify-center">
                                            03
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wide">Identity Matrix Sync</h5>
                                            <p className="text-[10.5px] text-muted-foreground/90 mt-1 leading-relaxed">
                                                Update fields like legal name, program, date of birth, guardian, and address, then click <strong>Sync Identity Payload</strong> to commit database updates.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 bg-white/40 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/30 dark:border-zinc-800/30 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:border-[#8B1E1E]/20 transition-all duration-300">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-[#8B1E1E]/5 dark:bg-[#8B1E1E]/15 text-[#8B1E1E] dark:text-[#E27676] font-black text-xs flex items-center justify-center">
                                            04
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wide">Generate Vector Card</h5>
                                            <p className="text-[10.5px] text-muted-foreground/90 mt-1 leading-relaxed">
                                                A digital ISO-aligned 3.5" x 2.0" template generates automatically, featuring security watermarks and issuing signatures.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
 
                    {/* Printable Business Card */}
                    {student && (
                        <div className="flex flex-col items-center gap-6 w-full h-full justify-center">
                            {/* Live Engine Header Notification */}
                            <div className="w-full max-w-[500px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 p-3.5 flex items-center gap-3.5 shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-[#C5A03A]/10 dark:bg-[#C5A03A]/15 text-[#C5A03A] flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <div className="text-[11px] leading-relaxed text-left flex-1">
                                    <span className="font-extrabold text-foreground block uppercase tracking-wide text-[10px]">Active Identity Syncing Canvas</span>
                                    <span className="text-muted-foreground/90 font-medium">
                                        Adjust details or click the photo placeholder on the <strong>Live Details</strong> tab to upload a student photograph.
                                    </span>
                                </div>
                            </div>

                            <div className="relative group origin-center scale-[0.45] sm:scale-[0.6] md:scale-[0.8] lg:scale-[0.95] xl:scale-[0.75] 2xl:scale-[0.9] transition-transform duration-300">
                                <PrintableBusinessCard student={student} cardId="printable-business-card-preview" />
                                
                                {/* Hover Overlay indicating structural physical bounds */}
                                <div className="absolute -inset-4 border border-[#8B1E1E]/0 group-hover:border-[#8B1E1E]/40 border-dashed rounded-[40px] pointer-events-none transition-all duration-300"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- STRICTLY PRINTABLE & EXPORT TARGET ONLY (Off-screen on screen media, centered on print) --- */}
            <div className="absolute left-[-9999px] top-[-9999px] print:left-0 print:top-0 print:absolute print:inset-0 print:m-0 print:flex print:items-center print:justify-center print:bg-white print:w-full print:h-full print:z-[9999]">
                {student && <PrintableBusinessCard student={student} isPrint={true} cardId="printable-business-card" />}
            </div>

        </div>
    );
};

// =========================================================================
// THE ANTI-COUNTERFEIT BUSINESS CARD ENGINE (3.5x2 inches -> 300DPI)
// =========================================================================

// Deterministic CSS Generator
const generateUniqueGradient = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = Math.abs(hash * 2) % 360;
    return `linear-gradient(${hash % 360}deg, hsl(${h1}, 65%, 98%), hsl(${h2}, 45%, 99%))`;
};

const PrintableBusinessCard = ({ student, isPrint = false, cardId }: { student: StudentData, isPrint?: boolean, cardId?: string }) => {
    const displayName = student?.name || 'FIRSTNAME LASTNAME';
    const displayClass = student?.studentClass?.name || student?.department || 'TECHNOLOGY PROGRAM';
    const displayEnrollment = student?.enrollmentNumber || student?._id?.substring(0, 10).toUpperCase() || 'XXX-000';
    
    // We add a cache-buster parameter specifically for CORS loading in canvas.
    const photo = student.photoUrl 
        ? `${resolvePhotoUrl(student.photoUrl)}${student.photoUrl.includes('?') ? '&' : '?'}cb=${student._id}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=300&background=F3F4F6&color=8B1E1E&cb=${student._id}`;

    const qrPayload = `https://verification.firstborn-technologies.com/verify/${btoa(student._id)}`;
    const microText = (student._id + " VERIFIED FIRSTBORN SECURE ID ").repeat(150);

    return (
        <div
            id={cardId}
            className="overflow-hidden relative flex flex-col bg-white font-sans border border-zinc-200/50 shadow-2xl"
            style={{
                width: '1015px', // Exact 3.5 inches at 290DPI print standard
                height: '580px', // Exact 2.0 inches at 290DPI print standard
                borderRadius: isPrint ? '0px' : '24px',
                background: 'radial-gradient(circle at 100% 0%, rgba(197, 160, 58, 0.05) 0%, transparent 40%), radial-gradient(circle at 0% 100%, rgba(139, 30, 30, 0.05) 0%, transparent 40%), repeating-linear-gradient(45deg, rgba(197, 160, 58, 0.012) 0px, rgba(197, 160, 58, 0.012) 1px, transparent 1px, transparent 15px), repeating-linear-gradient(-45deg, rgba(197, 160, 58, 0.012) 0px, rgba(197, 160, 58, 0.012) 1px, transparent 1px, transparent 15px), linear-gradient(to bottom, #FFFFFF, #FAF9F6)'
            }}
        >
            {/* MICRO-TEXT SECURITY OVERLAY */}
            <div className="absolute inset-0 pointer-events-none z-[99] break-words overflow-hidden text-black opacity-[0.02] font-mono text-[7px] leading-[7px] select-none text-justify">
                {microText}
            </div>

            {/* GHOST IMAGE SECURITY WATERMARK (using img element with crossOrigin for html2canvas support) */}
            <img
                src={photo}
                alt=""
                crossOrigin="anonymous"
                className="absolute right-[-70px] bottom-[-70px] w-[450px] h-[450px] opacity-[0.04] grayscale mix-blend-multiply pointer-events-none rounded-full object-cover select-none"
            />

            {/* Header Section (Crimson Theme with Gold Accent Line & Gold Plaque Badge) */}
            <div className="bg-[#8B1E1E] relative z-20 flex items-center justify-between px-8 py-4 shadow-sm border-b-[4px] border-[#C5A03A]" style={{ background: 'linear-gradient(135deg, #8B1E1E 0%, #6E1717 100%)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-[62px] h-[62px] bg-gradient-to-tr from-white to-zinc-100 rounded-full flex items-center justify-center shadow-md border border-zinc-200/50">
                        <School className="w-7 h-7 text-[#8B1E1E]" />
                    </div>
                    <div>
                        <h1 className="text-white text-[24px] font-black tracking-tighter leading-none mb-1">FIRSTBORN TECHNOLOGIES</h1>
                        <p className="text-[#C5A03A] text-[10px] font-extrabold tracking-[0.25em] uppercase">{displayClass}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-[#C5A03A] to-[#D5B04A] text-zinc-950 border border-[#C5A03A]/20 px-4.5 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(197,160,58,0.25)]">
                    <p className="font-black text-[13px] tracking-widest uppercase mb-0">STUDENT</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 relative z-20">

                {/* Left Side: Photo & QR Validation */}
                <div className="w-[280px] flex flex-col items-center justify-center p-6 border-r border-dashed border-zinc-300 dark:border-zinc-700/80 relative bg-white/40 backdrop-blur-xs">
                    {/* Profile Picture */}
                    <div className="w-[170px] h-[200px] rounded-2xl p-1 bg-gradient-to-b from-[#C5A03A]/25 to-transparent border border-[#C5A03A]/50 shadow-[0_8px_30px_rgba(197,160,58,0.12)] overflow-hidden mb-4 z-10">
                        <img 
                            src={photo} 
                            alt="" 
                            crossOrigin="anonymous" 
                            className="w-full h-full object-cover rounded-xl bg-white" 
                        />
                    </div>

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                        <div className="bg-white p-2.5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-zinc-200/60">
                            <QRCode
                                value={qrPayload}
                                size={80}
                                fgColor="#8B1E1E"
                                bgColor="transparent"
                                level="M"
                            />
                        </div>
                        <span className="text-[7.5px] font-black text-[#C5A03A] tracking-[0.25em] uppercase select-none">Secure ID Verification</span>
                    </div>
                </div>

                {/* Right Side: Identity Details */}
                <div className="flex-1 p-8 flex flex-col justify-center bg-white/50 backdrop-blur-xs">
                    <div className="mb-6">
                        <h2 className="text-[40px] font-black text-[#8B1E1E] tracking-tight uppercase leading-none">{displayName}</h2>
                        <div className="w-[100px] h-[3.5px] bg-[#C5A03A] rounded-full mt-2 mb-3" />
                        <div className="flex items-center gap-3 mt-2">
                            <span className="bg-[#8B1E1E]/8 text-[#8B1E1E] dark:bg-zinc-800/80 dark:text-zinc-300 px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider rounded-md border border-[#8B1E1E]/20">
                                {displayEnrollment}
                            </span>
                            <span className="text-zinc-500 font-extrabold text-xs uppercase tracking-wide flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> D.O.B: {student?.dob ? new Date(student.dob).toLocaleDateString('en-GB') : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-5 gap-x-8 mt-2 w-full max-w-[540px]">
                        <div className="border-l-2 border-[#C5A03A]/45 pl-3.5">
                            <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Parent / Guardian</span>
                            <span className="block text-[14px] font-bold text-zinc-800 leading-tight">{student?.fatherName || 'Not Registered'}</span>
                        </div>

                        <div className="border-l-2 border-[#C5A03A]/45 pl-3.5">
                            <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Contact Number</span>
                            <span className="block text-[14px] font-mono font-bold text-zinc-800 leading-tight">{student?.phone || 'N/A'}</span>
                        </div>

                        <div className="border-l-2 border-[#C5A03A]/45 pl-3.5">
                            <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Academic Cohort</span>
                            <span className="block text-[14px] font-semibold text-zinc-800 leading-tight">{student?.courseDuration || 'N/A'}</span>
                        </div>

                        <div className="border-l-2 border-[#C5A03A]/45 pl-3.5">
                            <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Date of Birth</span>
                            <span className="block text-[14px] font-semibold text-[#8B1E1E] leading-tight">{student?.dob ? new Date(student.dob).toLocaleDateString('en-GB') : 'N/A'}</span>
                        </div>

                        <div className="col-span-2 border-l-2 border-[#C5A03A]/45 pl-3.5 mt-0.5">
                            <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Permanent Address</span>
                            <span className="block text-[12px] font-semibold text-zinc-700 leading-relaxed max-w-[460px]">
                                {student?.presentAddress || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Gold Stamp Seal */}
            <div className="absolute right-[225px] bottom-[90px] w-[85px] h-[85px] rounded-full border border-dashed border-[#C5A03A]/30 flex items-center justify-center pointer-events-none opacity-50 bg-[#C5A03A]/3 select-none">
                <div className="w-[73px] h-[73px] rounded-full border border-double border-[#C5A03A]/40 flex flex-col items-center justify-center text-[7px] text-[#C5A03A] font-extrabold uppercase tracking-tighter text-center leading-none">
                    <ShieldCheck className="w-5 h-5 mb-0.5 text-[#C5A03A]/70" />
                    <span className="mb-0.5">VERIFIED PASS</span>
                    <span className="text-[5.5px] text-[#C5A03A]/80">SECURITY DEPT</span>
                </div>
            </div>

            {/* Footer Bar (Security Specs & Corporate Address) */}
            <div className="h-[75px] bg-[#121212] relative z-20 flex flex-col justify-center px-8 border-t-[3px] border-[#C5A03A] gap-1 py-2">
                <div className="flex items-center justify-between text-zinc-400 font-semibold text-[10px]">
                    <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#C5A03A]" /> 
                        Nimbarka Tower, E-289, Sector 75, Mohali, Punjab
                    </span>
                    <span className="text-zinc-500 font-mono text-[8px] uppercase tracking-widest">
                        VERIFICATION SIGNATURE KEY: {student._id.substring(0, 16).toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400 font-semibold text-[10.5px] border-t border-zinc-800/60 pt-1">
                    <div className="flex space-x-6">
                        <span className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1.5 text-[#C5A03A]" /> 
                            +91 9872591306, +91 9233946521
                        </span>
                        <span className="flex items-center">
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-[#C5A03A]" /> 
                            info@firstborn-technologies.com
                        </span>
                    </div>
                    <span className="text-zinc-500 text-[8.5px] font-bold uppercase tracking-wider">
                        Firstborn Secure Ecosystem
                    </span>
                </div>
            </div>

            {/* Signature Area */}
            <div className="absolute right-[45px] bottom-[90px] z-[30] opacity-80 text-center pointer-events-none">
                <div className="font-['Brush_Script_MT',cursive] text-[28px] text-[#8B1E1E] leading-none mb-1 -rotate-2">
                    Yong Ireanus
                </div>
                <div className="w-[140px] h-[1px] bg-zinc-300 mx-auto" />
                <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1 tracking-widest">Issuing Authority</p>
            </div>
        </div>
    );
};

export default StudentIdPrinter;
