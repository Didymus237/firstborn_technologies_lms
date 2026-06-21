import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Loader2,
  Calendar,
  FileText,
  UserCheck,
  Award,
  ArrowLeft,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { assignment, assignmentSubmission } from "@/types";

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  const [assignment, setAssignment] = useState<assignment | null>(null);
  const [loading, setLoading] = useState(true);

  // Student specific state
  const [submission, setSubmission] = useState<assignmentSubmission | null>(null);
  const [studentContent, setStudentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Teacher specific state
  const [allSubmissions, setAllSubmissions] = useState<assignmentSubmission[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [grading, setGrading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data);

      if (isStudent) {
        try {
          const subRes = await api.get(`/assignments/${id}/submission`);
          if (subRes.data) {
            setSubmission(subRes.data);
            setStudentContent(subRes.data.content);
          }
        } catch (e) {
          setSubmission(null);
        }
      }

      if (isTeacher) {
        const subsRes = await api.get(`/assignments/${id}/submissions`);
        setAllSubmissions(subsRes.data);
      }
    } catch (error) {
      toast.error("Failed to load assignment");
      navigate("/lms/assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
        <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!assignment) {
      navigate("/lms/assignments");
      return;
  }

  const isExpired = new Date() > new Date(assignment.dueDate);

  const handleTeacherDelete = async () => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success("Assignment deleted");
      navigate("/lms/assignments");
    } catch (error) {
      toast.error("Failed to delete assignment");
    }
  };

  const handleStudentSubmit = async () => {
    if (!studentContent.trim()) {
      toast.error("Submission content cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post(`/assignments/${id}/submit`, {
        content: studentContent,
      });
      toast.success("Assignment submitted successfully!");
      setSubmission(data.submission);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTeacherGrade = async (studentId: string) => {
    if (!gradeScore || Number(gradeScore) < 0 || Number(gradeScore) > assignment.points) {
        toast.error(`Score must be between 0 and ${assignment.points}`);
        return;
    }
    try {
        setGrading(true);
        await api.put(`/assignments/${id}/grade/${studentId}`, {
            score: Number(gradeScore),
            feedback: gradeFeedback
        });
        toast.success("Grade saved!");
        setGradingId(null);
        setGradeScore("");
        setGradeFeedback("");
        fetchData(); // Refresh list to get updated status
    } catch (error) {
        toast.error("Failed to save grade");
    } finally {
        setGrading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/lms/assignments")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <Badge variant={isExpired ? "secondary" : "default"}>
            {isExpired ? "Closed" : "Active"}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> {assignment.subject?.name || "Topic"}
            </div>
            <div className="flex items-center gap-1">
                <Award className="h-4 w-4" /> Max Points: {assignment.points}
            </div>
            <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </div>
        </div>
      </div>

      {isTeacher && (
        <>
            <Separator />
            <div className="bg-card p-4 rounded-lg flex items-center justify-between border">
                <div className="text-lg font-semibold">Teacher Controls</div>
                <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleTeacherDelete}>
                    Delete Assignment
                    </Button>
                </div>
            </div>
        </>
      )}

      {/* Assignment Description Panel */}
      <Card>
          <CardHeader>
              <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="whitespace-pre-wrap text-muted-foreground bg-secondary/30 p-4 rounded-md">
                  {assignment.description || "No instructions provided for this assignment."}
              </div>
          </CardContent>
      </Card>

      {/* Teacher Role: Viewing Submissions */}
      {isTeacher && (
          <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Student Submissions</h2>
              {allSubmissions.length === 0 ? (
                  <div className="border border-dashed p-8 rounded-lg text-center text-muted-foreground">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No students have submitted this assignment yet.
                  </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {allSubmissions.map((sub) => (
                      <Card key={sub._id} className={gradingId === sub.student._id ? "ring-2 ring-primary" : ""}>
                          <CardHeader className="py-4">
                              <div className="flex items-center justify-between">
                                  <div className="font-semibold text-lg">{sub.student?.name || "Unknown Student"}</div>
                                  <Badge variant={sub.status === "graded" ? "default" : sub.status === "late" ? "destructive" : "secondary"}>
                                      {sub.status.toUpperCase()}
                                  </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                  Submitted: {new Date(sub.submittedAt).toLocaleString()}
                              </div>
                          </CardHeader>
                          <CardContent>
                              <div className="bg-secondary/40 p-4 rounded-md whitespace-pre-wrap text-sm border">
                                  {sub.content}
                              </div>
                              
                              {/* Display existing grade */}
                              {sub.status === "graded" && gradingId !== sub.student._id && (
                                  <div className="mt-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                                      <div className="font-bold text-primary">Score: {sub.score} / {assignment.points}</div>
                                      {sub.feedback && <div className="text-sm mt-1">Feedback: {sub.feedback}</div>}
                                  </div>
                              )}

                              {/* Grading Interface */}
                              {gradingId === sub.student._id ? (
                                  <div className="mt-4 space-y-3 bg-secondary/20 p-4 rounded-lg border border-primary/30">
                                      <div className="flex items-center gap-4">
                                          <div className="w-32">
                                            <Label>Score (Max {assignment.points})</Label>
                                            <Input 
                                                type="number" 
                                                value={gradeScore} 
                                                onChange={(e) => setGradeScore(e.target.value)}
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <Label>Feedback (Optional)</Label>
                                            <Input 
                                                type="text" 
                                                value={gradeFeedback} 
                                                onChange={(e) => setGradeFeedback(e.target.value)}
                                                placeholder="Excellent work on..."
                                            />
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-2 mt-2">
                                          <Button size="sm" onClick={() => handleTeacherGrade(sub.student._id)} disabled={grading}>
                                              {grading ? "Saving..." : "Save Grade"}
                                          </Button>
                                          <Button size="sm" variant="ghost" onClick={() => setGradingId(null)}>Cancel</Button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="mt-4">
                                      <Button variant="outline" size="sm" onClick={() => {
                                          setGradingId(sub.student._id);
                                          setGradeScore(sub.score ? String(sub.score) : "");
                                          setGradeFeedback(sub.feedback || "");
                                      }}>
                                          {sub.status === "graded" ? "Edit Grade" : "Grade Submission"}
                                      </Button>
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                  ))}
                </div>
              )}
          </div>
      )}

      {/* Student Role: Submit Form */}
      {isStudent && (
          <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Your Submission</h2>
              
              {submission?.status === "graded" && (
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-primary">Graded</h3>
                        <div className="text-2xl font-black text-primary border-b-2 border-primary">{submission.score} <span className="text-lg font-normal text-muted-foreground">/ {assignment.points}</span></div>
                    </div>
                    {submission.feedback && (
                        <div className="bg-white dark:bg-black/50 p-4 rounded-md text-sm border shadow-sm">
                            <span className="font-semibold block mb-1">Teacher Feedback:</span>
                            {submission.feedback}
                        </div>
                    )}
                </div>
              )}

              <Card>
                  <CardContent className="pt-6">
                      <Label className="mb-2 block">Answer Content</Label>
                      <Textarea 
                          className="min-h-[200px]" 
                          placeholder={submission ? "" : "Type your answer or paste a link to your work here..."}
                          value={studentContent}
                          onChange={(e) => setStudentContent(e.target.value)}
                          disabled={!!submission}
                      />
                  </CardContent>
                  {!submission && (
                      <CardFooter>
                          <Button 
                              onClick={handleStudentSubmit} 
                              disabled={submitting}
                              className="w-full sm:w-auto"
                          >
                              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Assignment"}
                          </Button>
                      </CardFooter>
                  )}
                  {submission && (
                      <CardFooter className="text-sm text-muted-foreground flex items-center justify-between">
                          <span>Status: <Badge variant="outline">{submission.status.toUpperCase()}</Badge></span>
                          <span>Submitted on {new Date(submission.submittedAt).toLocaleString()}</span>
                      </CardFooter>
                  )}
              </Card>
          </div>
      )}
    </div>
  );
};

export default AssignmentDetails;
