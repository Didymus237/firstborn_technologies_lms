import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, UploadCloud, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Class, subject } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MaterialUploader = ({ open, onOpenChange, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<subject[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, clsRes] = await Promise.all([
          api.get("/subjects"),
          api.get("/classes"),
        ]);
        setSubjects(Array.isArray(subRes.data) ? subRes.data : subRes.data.data || []);
        setClasses(clsRes.data.data || clsRes.data.classes || []);
      } catch (error) {
        console.error("Failed to load options");
      }
    };
    if (open) fetchData();
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 50 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 50MB.");
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedClass || !selectedSubject || !file) {
      toast.error("Please fill in all required fields and attach a file.");
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("class", selectedClass);
      formData.append("subject", selectedSubject);
      formData.append("file", file); // Must match backend upload.single("file")

      // Use native axios / standard content type override for multipart form data
      await api.post("/materials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Study material uploaded successfully");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload material");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedClass("");
    setSelectedSubject("");
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Intro to Algebra Notes"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class <span className="text-red-500">*</span></Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject <span className="text-red-500">*</span></Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub._id} value={sub._id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional overview of this material..."
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>File Attachment <span className="text-red-500">*</span></Label>
            {!file ? (
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer relative">
                    <Input 
                        type="file" 
                        onChange={handleFileChange} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx"
                    />
                    <UploadCloud className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">Click or drag file to upload</span>
                    <span className="text-xs mt-1 text-muted-foreground/70">PDF, Word, Images up to 50MB</span>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-primary/10 p-2 rounded text-primary">
                            <UploadCloud className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading || !file}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialUploader;
