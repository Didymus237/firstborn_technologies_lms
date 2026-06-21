import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Save } from "lucide-react";

export default function SchoolSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: "",
    currentTerm: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/settings/school");
        if (data) {
          setFormData({
            schoolName: data.schoolName || "",
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
            currentTerm: data.currentTerm || "1st Term",
          });
        }
      } catch (error) {
        toast.error("Failed to load school settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings/school", formData);
      toast.success("School configurations updated perfectly!");
    } catch (error) {
      toast.error("An error occurred trying to override global settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground">
          Manage global application parameters like School Information, Address, and Academic Terms.
        </p>
      </div>

      <Card className="max-w-2xl shadow-sm border-primary/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <CardTitle>School Information</CardTitle>
          </div>
          <CardDescription>
            These details will be used consistently across all reports, timetables, and email templates natively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName">Official School Title</Label>
            <Input
              id="schoolName"
              placeholder="Firstborn Technologies Academy"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Administrative Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@school.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Physical Address</Label>
            <Input
              id="address"
              placeholder="123 Education Boulevard, Tech City, ST 12345"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <Label>Active Academic Term</Label>
            <Select
              value={formData.currentTerm}
              onValueChange={(val) => setFormData({ ...formData, currentTerm: val })}
            >
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st Term">1st Term (Fall)</SelectItem>
                <SelectItem value="2nd Term">2nd Term (Winter/Spring)</SelectItem>
                <SelectItem value="3rd Term">3rd Term (Summer)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select the chronological term currently in session across the institution.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border bg-muted/20 px-6 py-4">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
