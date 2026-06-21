import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, FileText, Image as ImageIcon, File, Loader2, Download, Trash2, Users } from "lucide-react";
import { useAuth } from "@/hooks/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { material } from "@/types";
import { toast } from "sonner";
import MaterialUploader from "@/components/lms/MaterialUploader";

const Materials = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const [materials, setMaterials] = useState<material[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/materials");
      setMaterials(data);
    } catch (error) {
      toast.error("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id: string, title: string) => {
      if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
      try {
          await api.delete(`/materials/${id}`);
          toast.success("Material deleted successfully");
          fetchMaterials();
      } catch (error) {
          toast.error("Failed to delete material");
      }
  };

  const getFileIcon = (fileType: string) => {
      if (fileType.includes("pdf")) return <FileText className="h-8 w-8 text-red-500" />;
      if (fileType.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-500" />;
      return <File className="h-8 w-8 text-slate-500" />;
  };

  // Convert logical url to generic accessible URL using backend exposed origin
  // If we are using standard VITE_API_BASE_URL: http://localhost:8001/api
  // We want to access http://localhost:8001/uploads/...
  const resolveFileUrl = (urlStr: string) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8001";
      return baseUrl + urlStr;
  };

  if (loading && materials.length === 0) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-muted-foreground">
            Access course resources, notes, and reading materials.
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setIsUploaderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Upload Material
          </Button>
        )}
      </div>

      {materials.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-lg h-64 bg-card text-muted-foreground">
          <File className="h-10 w-10 mb-2 opacity-50" />
          <p>No study materials uploaded yet</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {materials.map((mat) => (
            <Card className="hover:shadow-md transition-shadow group flex flex-col" key={mat._id}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg">
                            {getFileIcon(mat.fileType)}
                        </div>
                        <div>
                            <CardTitle className="text-base line-clamp-1" title={mat.title}>{mat.title}</CardTitle>
                            <div className="text-xs text-muted-foreground mt-1">
                                {(mat.fileSize / (1024 * 1024)).toFixed(2)} MB • {new Date(mat.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm flex-1 text-muted-foreground pb-2">
                    {mat.description && <p className="line-clamp-2 text-xs">{mat.description}</p>}
                    
                    <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className="font-normal text-xs">{mat.subject?.name || "Topic"}</Badge>
                        <div className="flex items-center gap-1 text-xs">
                            <Users className="h-3 w-3" /> {mat.class?.name || "Class"}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-3 border-t">
                    <div className="flex w-full gap-2">
                        <a 
                            href={resolveFileUrl(mat.fileUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <Button variant="secondary" className="w-full h-8 px-2 text-xs">
                                <Download className="h-3 w-3 mr-2" /> View / Download
                            </Button>
                        </a>
                        {isTeacher && (
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 px-0" 
                                onClick={() => handleDelete(mat._id, mat.title)}
                                title="Delete material"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        ))}
      </div>

      <MaterialUploader
        open={isUploaderOpen}
        onOpenChange={setIsUploaderOpen}
        onSuccess={fetchMaterials}
      />
    </div>
  );
};

export default Materials;
