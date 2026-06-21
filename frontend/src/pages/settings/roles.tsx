import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RolePermission {
  role: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  { id: "view_dashboard", label: "View Dashboard Analytics" },
  { id: "view_users", label: "View User Profiles" },
  { id: "manage_users", label: "Create & Edit Users" },
  { id: "view_academics", label: "View Classes & Timetables" },
  { id: "manage_academics", label: "Create & Edit Academics" },
  { id: "view_lms", label: "View LMS Content (Exams, Materials)" },
  { id: "manage_lms", label: "Create LMS Assignments & Exams" },
  { id: "manage_finance", label: "Manage Financial Data" },
  { id: "manage_settings", label: "Configure Global Settings" },
];

const ROLES = ["admin", "teacher", "student", "parent"];

export default function RolesAndPermissions() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrix, setMatrix] = useState<RolePermission[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/settings/school");
      if (data && data.rolePermissions && data.rolePermissions.length > 0) {
        setMatrix(data.rolePermissions);
      } else {
        // Fallback default
        setMatrix(ROLES.map(role => ({ role, permissions: [] })));
      }
    } catch (error) {
      toast.error("Failed to load Permissions Matrix");
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (role: string, permissionId: string) => {
    const roleObj = matrix.find(m => m.role === role);
    return roleObj ? roleObj.permissions.includes(permissionId) : false;
  };

  const handleToggle = (role: string, permissionId: string, checked: boolean) => {
    setMatrix(prev => prev.map(m => {
      if (m.role === role) {
        const perms = new Set(m.permissions);
        if (checked) {
          perms.add(permissionId);
        } else {
          perms.delete(permissionId);
        }
        return { ...m, permissions: Array.from(perms) };
      }
      return m;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings/school", { rolePermissions: matrix });
      toast.success("Role Permissions updated securely!");
    } catch (error) {
      toast.error("Failed to update access matrix.");
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
        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions Matrix</h1>
        <p className="text-muted-foreground">
          Advanced Access Control (RBAC). Visually define precise module privileges for every user role across the system.
        </p>
      </div>

      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary/80">
          Modifying privileges will instantly grant or revoke structural access to the system. Admins cannot revoke their own `manage_settings` parameter safely here to prevent complete lockouts.
        </AlertDescription>
      </Alert>

      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <CardTitle>System Privilege Assignments</CardTitle>
          </div>
          <CardDescription>
            Toggle individual permissions for each architectural user type.
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left align-middle border-collapse">
            <thead className="text-xs uppercase bg-muted/50 border-b border-border">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium text-foreground tracking-wider">
                  System Module (Resource)
                </th>
                {ROLES.map(role => (
                  <th key={role} scope="col" className="px-6 py-4 text-center font-medium tracking-wide">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {AVAILABLE_PERMISSIONS.map(perm => (
                <tr key={perm.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {perm.label}
                  </td>
                  {ROLES.map(role => {
                    // Lockout prevention logic visualization
                    const isLockedAdmin = role === 'admin' && perm.id === 'manage_settings';
                    return (
                      <td key={`${role}-${perm.id}`} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <Switch 
                            checked={isLockedAdmin ? true : hasPermission(role, perm.id)}
                            disabled={isLockedAdmin}
                            onCheckedChange={(checked) => handleToggle(role, perm.id, checked)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardFooter className="flex justify-end border-t border-border bg-muted/20 px-6 py-4 mt-0">
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary hover:bg-primary/90 text-white">
            {saving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Compile Security Matrix
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
