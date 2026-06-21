import React, { useState, useRef } from "react";
import { api } from "@/lib/api";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import { Save, MousePointer2, Type, Image as ImageIcon, QrCode, Baseline } from "lucide-react";
import { toast } from "sonner";

type FieldType = 'text' | 'photo' | 'qr' | 'barcode' | 'logo' | 'fixed-text';

interface Field {
    id: string;
    type: FieldType;
    label: string;
    key?: string;
    value?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    zIndex?: number;
}

const IdDesigner: React.FC = () => {
    
    // Template State
    const [name, setName] = useState("New ID Template");
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
    const [backgroundUrl, setBackgroundUrl] = useState("");
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");
    
    // Canvas dimensions based on Standard CR80 ID Card
    const canvasWidth = orientation === 'horizontal' ? 1011 : 638;
    const canvasHeight = orientation === 'horizontal' ? 638 : 1011;
    
    // Fields State
    const [fields, setFields] = useState<Field[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

    // Drag-and-Drop interaction state
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    // Mongoose mapping keys available
    const availableKeys = [
        { label: "First Name", value: "firstName" },
        { label: "Last Name", value: "lastName" },
        { label: "Full Name", value: "fullName" },
        { label: "Roll Number", value: "rollNumber" },
        { label: "Role", value: "role" },
        { label: "Blood Group", value: "bloodGroup" },
        { label: "Phone", value: "phone" }
    ];

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addField = (type: FieldType) => {
        const newField: Field = {
            id: generateId(),
            type,
            label: `New ${type}`,
            x: 50,
            y: 50,
            fontSize: type === 'text' || type === 'fixed-text' ? 24 : undefined,
            color: "#000000",
            fontFamily: "Inter",
            width: type === 'qr' || type === 'photo' || type === 'logo' ? 150 : (type === 'barcode' ? 300 : undefined),
            height: type === 'qr' || type === 'photo' || type === 'logo' ? 150 : (type === 'barcode' ? 100 : undefined),
            zIndex: 10
        };
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
        if (!canvasRef.current) return;
        setSelectedFieldId(fieldId);
        setIsDragging(true);

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const field = fields.find(f => f.id === fieldId);
        if (field) {
            // Calculate where exactly on the element the user clicked relative to its local Top-Left
            const scaleX = canvasWidth / canvasRect.width;
            const scaleY = canvasHeight / canvasRect.height;
            
            const mouseX = (e.clientX - canvasRect.left) * scaleX;
            const mouseY = (e.clientY - canvasRect.top) * scaleY;

            setDragOffset({
                x: mouseX - field.x,
                y: mouseY - field.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !selectedFieldId || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasWidth / canvasRect.width;
        const scaleY = canvasHeight / canvasRect.height;

        const mouseX = (e.clientX - canvasRect.left) * scaleX;
        const mouseY = (e.clientY - canvasRect.top) * scaleY;

        let newX = mouseX - dragOffset.x;
        let newY = mouseY - dragOffset.y;

        // Optional: snap to grid or boundary limits
        if(newX < 0) newX = 0;
        if(newY < 0) newY = 0;

        setFields(fields.map(f => {
            if (f.id === selectedFieldId) {
                return { ...f, x: newX, y: newY };
            }
            return f;
        }));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const updateSelectedField = (updates: Partial<Field>) => {
        setFields(fields.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f));
    };

    const deleteSelectedField = () => {
        if (!selectedFieldId) return;
        setFields(fields.filter(f => f.id !== selectedFieldId));
        setSelectedFieldId(null);
    };

    const saveTemplate = async () => {
        try {
            const payload = {
                name,
                orientation,
                width: canvasWidth,
                height: canvasHeight,
                backgroundUrl,
                backgroundColor,
                fields
            };
            
            await api.post("/id-cards/templates", payload);
            toast.success("Template Saved Successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save template");
            console.error("Save Error:", error);
        }
    };

    const selectedField = fields.find(f => f.id === selectedFieldId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] p-6 lg:p-8" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ID Card Designer</h1>
                        <p className="text-gray-500">Construct visual graphics identifying system constraints.</p>
                    </div>
                    <button 
                        onClick={saveTemplate}
                        className="bg-[#3ecf8e] text-black px-6 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-[#34b27b] transition-all"
                    >
                        <Save className="w-5 h-5" />
                        <span>Save Blueprint</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFTSIDE BAR: Tools & Properties */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Global Template Settings */}
                        <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Template Properties
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-black dark:text-white focus:border-[#3ecf8e] focus:ring-1 focus:ring-[#3ecf8e] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orientation</label>
                                    <select 
                                        value={orientation} 
                                        onChange={e => setOrientation(e.target.value as 'vertical' | 'horizontal')}
                                        className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-black dark:text-white focus:border-[#3ecf8e] focus:ring-1 focus:ring-[#3ecf8e] outline-none"
                                    >
                                        <option value="vertical">Vertical Portrait</option>
                                        <option value="horizontal">Horizontal Landscape</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
                                        <div className="flex space-x-2">
                                            <input 
                                                type="color" 
                                                value={backgroundColor} 
                                                onChange={e => setBackgroundColor(e.target.value)}
                                                className="h-10 w-10 rounded cursor-pointer p-0 border-0"
                                            />
                                            <input 
                                                type="text" 
                                                value={backgroundColor}
                                                onChange={e => setBackgroundColor(e.target.value)}
                                                className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-2 text-sm text-black dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BG Image URL</label>
                                        <input 
                                            type="text" 
                                            placeholder="https://"
                                            value={backgroundUrl} 
                                            onChange={e => setBackgroundUrl(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-black dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add Elements toolbox */}
                        <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Insert Elements
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => addField('text')} className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all text-gray-600 dark:text-gray-300">
                                    <Baseline className="w-5 h-5 mb-1 text-[#3ecf8e]" />
                                    <span className="text-xs font-semibold">Dynamic Text</span>
                                </button>
                                <button onClick={() => addField('fixed-text')} className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all text-gray-600 dark:text-gray-300">
                                    <Type className="w-5 h-5 mb-1 text-blue-400" />
                                    <span className="text-xs font-semibold">Fixed Text</span>
                                </button>
                                <button onClick={() => addField('photo')} className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all text-gray-600 dark:text-gray-300">
                                    <ImageIcon className="w-5 h-5 mb-1 text-purple-400" />
                                    <span className="text-xs font-semibold">User Photo</span>
                                </button>
                                <button onClick={() => addField('logo')} className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all text-gray-600 dark:text-gray-300">
                                    <ImageIcon className="w-5 h-5 mb-1 text-yellow-400" />
                                    <span className="text-xs font-semibold">School Logo</span>
                                </button>
                                <button onClick={() => addField('qr')} className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all text-gray-600 dark:text-gray-300">
                                    <QrCode className="w-5 h-5 mb-1 text-indigo-400" />
                                    <span className="text-xs font-semibold">QR Code</span>
                                </button>
                                <button onClick={() => addField('barcode')} className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all text-gray-600 dark:text-gray-300">
                                    <svg className="w-5 h-5 mb-1 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
                                    <span className="text-xs font-semibold">Barcode</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: The Main Canvas */}
                    <div className="lg:col-span-6 bg-[#eaeaea] dark:bg-[#0a0a0a] rounded-3xl border border-gray-300 dark:border-gray-800 flex items-center justify-center p-8 overflow-hidden relative shadow-inner h-[800px]">
                        
                        {/* THE GRAPHIC RENDER TARGET */}
                        <div 
                            ref={canvasRef}
                            id="design-canvas"
                            onMouseMove={handleMouseMove}
                            className="relative shadow-2xl bg-white transition-all overflow-hidden"
                            style={{
                                width: `${canvasWidth}px`,
                                height: `${canvasHeight}px`,
                                backgroundColor,
                                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                // CSS Matrix scale to fit within the editor viewport without skewing raw logical coordinates
                                transform: `scale(${canvasWidth > canvasHeight ? 0.6 : 0.65})`,
                                transformOrigin: 'center center'
                            }}
                        >
                            {/* Graphic Mapping Overlays */}
                            {fields.map(field => {
                                const isSelected = field.id === selectedFieldId;
                                
                                return (
                                    <div 
                                        key={field.id}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMouseDown(e, field.id);
                                        }}
                                        className={`absolute cursor-move select-none ${isSelected ? 'ring-2 ring-[#3ecf8e] ring-offset-2 ring-offset-black/10' : ''}`}
                                        style={{
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
                                            padding: '4px'
                                        }}
                                    >
                                        {field.type === 'text' && (
                                            <div>{'{' + (field.key || 'Mapped Field') + '}'}</div>
                                        )}
                                        {field.type === 'fixed-text' && (
                                            <div>{field.value || 'Fixed Text String'}</div>
                                        )}
                                        {field.type === 'photo' && (
                                            <div className="w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 overflow-hidden">
                                                <ImageIcon className="w-8 h-8 opacity-50 absolute" />
                                                <span className="relative z-10 text-xs font-bold drop-shadow-md bg-white/50 px-1 rounded">USER_PHOTO</span>
                                            </div>
                                        )}
                                        {field.type === 'logo' && (
                                            <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 overflow-hidden">
                                                <span className="relative z-10 text-xs font-bold">SCHOOL_LOGO</span>
                                            </div>
                                        )}
                                        {field.type === 'qr' && (
                                            <div className="bg-white p-2">
                                                <QRCode value="123456789" size={field.width ? field.width - 16 : 100} />
                                            </div>
                                        )}
                                        {field.type === 'barcode' && (
                                            <div className="bg-white p-2 flex items-center justify-center w-full h-full">
                                                <Barcode value="123456" width={2} height={field.height ? field.height - 20 : 50} displayValue={false} background="transparent" />
                                            </div>
                                        )}

                                        {/* Drag Handle Indicator */}
                                        {isSelected && (
                                            <div className="absolute -top-3 -left-3 bg-[#3ecf8e] text-black rounded-full p-1 shadow-md">
                                                <MousePointer2 className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHTSIDE BAR: Selected Object Inspector */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Field Inspector
                            </h3>
                            
                            {selectedField ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Field Type</label>
                                        <div className="bg-gray-100 dark:bg-[#2a2a2a] px-3 py-2 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200 uppercase">
                                            {selectedField.type}
                                        </div>
                                    </div>

                                    {(selectedField.type === 'text') && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Database Map Key</label>
                                            <select 
                                                value={selectedField.key || ""}
                                                onChange={(e) => updateSelectedField({ key: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-black dark:text-white outline-none"
                                            >
                                                <option value="">-- Select Map Key --</option>
                                                {availableKeys.map(k => (
                                                    <option key={k.value} value={k.value}>{k.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {selectedField.type === 'fixed-text' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Text String</label>
                                            <input 
                                                type="text"
                                                value={selectedField.value || ""}
                                                onChange={(e) => updateSelectedField({ value: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">X Pos (px)</label>
                                            <input 
                                                type="number"
                                                value={Math.round(selectedField.x)}
                                                onChange={(e) => updateSelectedField({ x: Number(e.target.value) })}
                                                className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Y Pos (px)</label>
                                            <input 
                                                type="number"
                                                value={Math.round(selectedField.y)}
                                                onChange={(e) => updateSelectedField({ y: Number(e.target.value) })}
                                                className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {(selectedField.type === 'qr' || selectedField.type === 'barcode' || selectedField.type === 'photo' || selectedField.type === 'logo') && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Width (px)</label>
                                                <input 
                                                    type="number"
                                                    value={selectedField.width || 0}
                                                    onChange={(e) => updateSelectedField({ width: Number(e.target.value) })}
                                                    className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Height (px)</label>
                                                <input 
                                                    type="number"
                                                    value={selectedField.height || 0}
                                                    onChange={(e) => updateSelectedField({ height: Number(e.target.value) })}
                                                    className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(selectedField.type === 'text' || selectedField.type === 'fixed-text') && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Font Size</label>
                                                <input 
                                                    type="number"
                                                    value={selectedField.fontSize || 14}
                                                    onChange={(e) => updateSelectedField({ fontSize: Number(e.target.value) })}
                                                    className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Color</label>
                                                <input 
                                                    type="color"
                                                    value={selectedField.color || "#000000"}
                                                    onChange={(e) => updateSelectedField({ color: e.target.value })}
                                                    className="w-full h-10 bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-1 cursor-pointer"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Font Weight</label>
                                                <select 
                                                    value={selectedField.fontWeight || "normal"}
                                                    onChange={(e) => updateSelectedField({ fontWeight: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-black dark:text-white outline-none"
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="bold">Bold</option>
                                                    <option value="900">Black/Heavy</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-800">
                                        <button 
                                            onClick={deleteSelectedField}
                                            className="w-full bg-red-500/10 text-red-500 font-bold py-2.5 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20"
                                        >
                                            Delete Node
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                    <MousePointer2 className="w-10 h-10 mb-4 opacity-30" />
                                    <p className="text-sm">Click any element on the canvas to edit its properties.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdDesigner;
