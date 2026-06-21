import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Download, Layers, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";

const IdGenerator: React.FC = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);



    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [tempRes, userRes] = await Promise.all([
                api.get("/id-cards/templates"),
                api.get("/users?role=student") // Or no role param if you want all
            ]);
            setTemplates(tempRes.data || []);
            // Assuming userRes.data is an array of users or userRes.data.users
            setUsers(Array.isArray(userRes.data) ? userRes.data : userRes.data.users || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load initial data");
        }
        setIsLoading(false);
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleAllUsers = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u._id));
        }
    };

    // Safely extract nested keys from objects, e.g. "profile.firstName"
    const resolveFieldValue = (user: any, key?: string) => {
        if (!key) return "";
        const parts = key.split('.');
        let current = user;
        for (const part of parts) {
            if (current[part] === undefined) return "";
            current = current[part];
        }
        return String(current);
    };

    const generateIdCards = async (format: 'pdf' | 'png') => {
        if (!selectedTemplate) return toast.error("Please select a template first.");
        if (selectedUsers.length === 0) return toast.error("Please select at least one user.");

        setIsGenerating(true);
        setProgress(0);

        try {
            const zip = new JSZip();
            const targetUsers = users.filter(u => selectedUsers.includes(u._id));
            
            for (let i = 0; i < targetUsers.length; i++) {
                const user = targetUsers[i];
                
                // 1. We must wait a tiny bit to allow React to flush the DOM update to the hidden generic div
                await new Promise(resolve => setTimeout(resolve, 50)); 
                
                // 2. Locate the specific hidden rendered ID card for this user
                const cardElement = document.getElementById(`hidden-card-${user._id}`);
                if (!cardElement) continue;

                // 3. Render it to a canvas graphic using html2canvas
                const canvas = await html2canvas(cardElement, {
                    scale: 2, // High resolution override
                    useCORS: true,
                    backgroundColor: selectedTemplate.backgroundColor || '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');

                if (format === 'pdf') {
                    // Initialize PDF (Orientation varies based on template width/height)
                    const orientation = selectedTemplate.width > selectedTemplate.height ? 'l' : 'p';
                    // We assume physical dimensions correlate to CR80 in mm standard ~ 85.6 x 53.98
                    // but we will just map pixels to points for pristine layout ratios.
                    const pdf = new jsPDF({
                        orientation: orientation,
                        unit: 'px',
                        format: [selectedTemplate.width, selectedTemplate.height]
                    });
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, selectedTemplate.width, selectedTemplate.height);
                    const pdfBlob = pdf.output('blob');
                    zip.file(`${user.firstName || user.name || 'User'}_${user._id}.pdf`, pdfBlob);
                } else {
                    // Extract base64 securely resolving out the data URI prefix
                    const base64Data = imgData.replace(/^data:image\/(png|jpg);base64,/, "");
                    zip.file(`${user.firstName || user.name || 'User'}_${user._id}.png`, base64Data, { base64: true });
                }

                setProgress(Math.round(((i + 1) / targetUsers.length) * 100));
            }

            // 4. Generate the ultimate bundled Zip
            const content = await zip.generateAsync({ type: "blob" });
            
            // 5. Trigger download
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = `ID_Cards_Batch_${new Date().getTime()}.zip`;
            link.click();
            
            toast.success(`Successfully Generated ${targetUsers.length} ID Cards!`);
        } catch (error) {
            console.error("Export Error:", error);
            toast.error("An error occurred during graphic generation.");
        }

        setIsGenerating(false);
        setProgress(0);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-gray-50 dark:bg-[#121212]">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bulk ID Generator</h1>
                    <p className="text-gray-500">Rapidly export dynamic graphical identities across your organization.</p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => generateIdCards('png')}
                        disabled={isGenerating || !selectedTemplate || selectedUsers.length === 0}
                        className="bg-gray-200 dark:bg-[#2a2a2a] text-gray-800 dark:text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        Export ZIP (PNG)
                    </button>
                    <button 
                        onClick={() => generateIdCards('pdf')}
                        disabled={isGenerating || !selectedTemplate || selectedUsers.length === 0}
                        className="bg-[#3ecf8e] text-black px-5 py-2 rounded-lg font-bold hover:bg-[#34b27b] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-[#3ecf8e]/20"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                        Export ZIP (PDF)
                    </button>
                </div>
            </div>

            {isGenerating && (
                <div className="mb-8 bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-[#3ecf8e]/30 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-[#3ecf8e] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Loader2 className="w-6 h-6 animate-spin text-[#3ecf8e]" />
                            <h3 className="font-bold text-gray-900 dark:text-white animate-pulse">Rendering Application Graphics...</h3>
                        </div>
                        <span className="font-black text-[#3ecf8e] text-2xl">{progress}%</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* SELECT TEMPLATE BAR */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center">
                            <Layers className="w-5 h-5 mr-2" />
                            Active Templates
                        </h3>
                        {isLoading ? (
                            <p className="text-gray-500 animate-pulse">Loading templates...</p>
                        ) : templates.length === 0 ? (
                            <p className="text-gray-500 text-sm">No templates found. Design one first!</p>
                        ) : (
                            <div className="space-y-3">
                                {templates.map(t => (
                                    <div 
                                        key={t._id}
                                        onClick={() => setSelectedTemplate(t)}
                                        className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedTemplate?._id === t._id ? 'border-[#3ecf8e] bg-[#3ecf8e]/5 shadow-md' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#121212] hover:border-gray-300 dark:hover:border-gray-700'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</h4>
                                            {selectedTemplate?._id === t._id && <CheckCircle className="w-4 h-4 text-[#3ecf8e]" />}
                                        </div>
                                        <div className="flex space-x-2 text-xs text-gray-500">
                                            <span className="bg-white dark:bg-[#2a2a2a] px-2 py-1 rounded shadow-sm capitalize">{t.orientation}</span>
                                            <span className="bg-white dark:bg-[#2a2a2a] px-2 py-1 rounded shadow-sm">{t.fields.length} Elements</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* USER SELECTOR TABLE */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[700px]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#151515]">
                            <h3 className="font-bold text-gray-900 dark:text-white">Target Matrix ({selectedUsers.length} Selected)</h3>
                            <button 
                                onClick={toggleAllUsers}
                                className="text-sm font-semibold text-[#3ecf8e] hover:text-[#34b27b]"
                            >
                                {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#151515] text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
                                        <th className="p-4 w-12 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedUsers.length === users.length && users.length > 0}
                                                onChange={toggleAllUsers}
                                                className="rounded border-gray-300 dark:border-gray-600 text-[#3ecf8e] focus:ring-[#3ecf8e]"
                                            />
                                        </th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr 
                                            key={u._id} 
                                            onClick={() => toggleUserSelection(u._id)}
                                            className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                                        >
                                            <td className="p-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedUsers.includes(u._id)}
                                                    onChange={() => {}} // Controlled by row click entirely
                                                    className="rounded border-gray-300 dark:border-gray-600 text-[#3ecf8e] focus:ring-[#3ecf8e]"
                                                />
                                            </td>
                                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                                                {u.firstName} {u.lastName}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">{u.email}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            {/* HIDDEN RENDER ZONE - This runs the HTML2Canvas logic offline securely in the React Shadow DOM */}
            {selectedTemplate && (
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', pointerEvents: 'none', opacity: 0 }}>
                    {users.filter(u => selectedUsers.includes(u._id)).map(user => (
                        <div 
                            key={user._id}
                            id={`hidden-card-${user._id}`}
                            style={{
                                width: `${selectedTemplate.width}px`,
                                height: `${selectedTemplate.height}px`,
                                backgroundColor: selectedTemplate.backgroundColor,
                                backgroundImage: selectedTemplate.backgroundUrl ? `url(${selectedTemplate.backgroundUrl})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {selectedTemplate.fields.map((field: any) => (
                                <div 
                                    key={field.id}
                                    style={{
                                        position: 'absolute',
                                        left: `${field.x}px`,
                                        top: `${field.y}px`,
                                        width: field.width ? `${field.width}px` : 'auto',
                                        height: field.height ? `${field.height}px` : 'auto',
                                        zIndex: field.zIndex,
                                        color: field.color,
                                        fontSize: `${field.fontSize}px`,
                                        fontFamily: field.fontFamily || 'Inter',
                                        fontWeight: field.fontWeight || 'normal',
                                        textAlign: field.textAlign || 'left',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {field.type === 'text' && (
                                        <div>{resolveFieldValue(user, field.key)}</div>
                                    )}
                                    {field.type === 'fixed-text' && (
                                        <div>{field.value}</div>
                                    )}
                                    {field.type === 'qr' && (
                                        <QRCode value={user._id} size={field.width || 100} />
                                    )}
                                    {field.type === 'barcode' && (
                                        <Barcode value={user._id.substring(0,12)} width={2} height={field.height || 50} displayValue={false} background="transparent" />
                                    )}
                                    {field.type === 'photo' && (
                                        <div style={{ width: '100%', height: '100%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '10px' }}>
                                            PHOTO
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IdGenerator;
