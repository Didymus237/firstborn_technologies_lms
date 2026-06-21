import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, FileText, Clock, Users, Loader2 } from "lucide-react";
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
import { useNavigate } from "react-router";
import type { assignment } from "@/types";
import { toast } from "sonner";
import AssignmentGenerator from "@/components/lms/AssignmentGenerator";

const Assignments = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const [assignments, setAssignments] = useState<assignment[]>([]);
  const [isGenOpen, setIsGenOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // fetch assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/assignments");
      setAssignments(data);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const date = new Date();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Manage course work, homework, and projects.
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setIsGenOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Assignment
          </Button>
        )}
      </div>
      {assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-lg h-64 bg-card text-muted-foreground">
          <FileText className="h-10 w-10 mb-2 opacity-50" />
          <p>No assignments found</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => {
          const isExpired = new Date(assignment.dueDate) < date;
          return (
            <Card className="hover:shadow-md transition-shadow group flex flex-col" key={assignment._id}>
              <CardHeader>
                <div className="flex items-center justify-between pb-2">
                  <Badge variant={isExpired ? "secondary" : "default"}>
                    {isExpired ? "Closed" : "Active"}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2 font-medium">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="mt-2 text-lg line-clamp-1">{assignment.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm flex-1 text-muted-foreground">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {assignment.subject?.name || "Unknown Subject"}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {assignment.class?.name || "Unknown Class"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Max: {assignment.points} Points
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={isExpired ? "outline" : "default"}
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => navigate(`/lms/assignments/${assignment._id}`)}
                >
                  {isTeacher ? "Grade Submissions" : "View & Submit"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <AssignmentGenerator
        open={isGenOpen}
        onOpenChange={setIsGenOpen}
        onSuccess={fetchAssignments}
      />
    </div>
  );
};

export default Assignments;
