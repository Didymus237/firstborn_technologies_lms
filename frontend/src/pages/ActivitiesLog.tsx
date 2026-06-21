import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ActivitiesLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/activities");
        setLogs(data.logs || []);
      } catch (error) {
        console.error("Failed to load activities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 flex-1">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Activity Log</h2>
          <p className="text-muted-foreground">
            A complete audit trail of user actions across the platform.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>
            Showing the latest logged activity in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No activities found.</p>
            ) : (
              logs.map((log, i) => (
                <div key={log._id || i} className="flex items-start">
                  <span className="flex h-2 w-2 translate-y-2 rounded-full bg-primary" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {log.user?.name || "System"} performed: <span className="font-bold">{log.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.details && <span className="mr-2">{log.details} •</span>}
                      {format(new Date(log.createdAt), "PP pp")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
