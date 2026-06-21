import { useState } from "react";
import { Sparkles, RefreshCw, Lightbulb, BrainCircuit, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Props {
  role?: string;
}

export function AiInsightWidget({ role }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      // Simulation delay for premium feedback loop
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let mockResponse = "";
      if (role === "admin") {
        mockResponse =
          "Operational Insight: Grade 10B has shown a 15% drop in attendance on Fridays. Additionally, Math scores across the high school section have improved by 5% compared to last term. Recommendation: Schedule a review with Grade 10B lead coordinator.";
      } else if (role === "teacher") {
        mockResponse =
          "Pedagogical Observation: 3 students in your History class (John, Sarah, Mike) scored below 40% in the last 2 quizzes. I suggest assigning them the remedial 'World War II' reading material.";
      } else if (role === "student") {
        mockResponse =
          "Personalized Tip: Your Physics exam is in 3 days. Based on your quiz results, you should focus on 'Thermodynamics'. I've highlighted 2 key chapters for you in the Library.";
      } else {
        mockResponse = "System operations are nominal. No anomalies detected across active departments.";
      }

      setInsight(mockResponse);
      toast.success("Intelligence report updated successfully.");
    } catch (e) {
      toast.error("Could not generate insight");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-violet-50/40 via-white/80 to-indigo-50/20 dark:from-zinc-900/60 dark:to-zinc-950/70 border border-violet-200/50 dark:border-zinc-800/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 rounded-2xl h-full flex flex-col justify-between group">
      
      {/* Dynamic top gradient line to denote AI context */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-violet-600 via-indigo-500 to-[#8B1E1E]" />

      {/* Decorative background brain circuit grid */}
      <BrainCircuit className="absolute -right-6 -bottom-6 h-36 w-36 text-violet-500/5 dark:text-violet-400/5 group-hover:scale-105 transition-transform duration-700 pointer-events-none" />

      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400 animate-pulse" />
            <span>AI Operations Advisor</span>
          </CardTitle>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-violet-600 hover:text-violet-800 hover:bg-violet-100/60 dark:text-violet-400 dark:hover:text-violet-300 dark:hover:bg-zinc-800 rounded-lg"
            onClick={generateInsight}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>

        <CardContent className="pt-2">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-violet-100/50 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-[92%] bg-violet-100/50 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-[75%] bg-violet-100/50 dark:bg-zinc-800" />
            </div>
          ) : insight ? (
            <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 shrink-0">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-violet-800/80 dark:text-violet-400 uppercase tracking-wide">Analysis Report</p>
                <p className="text-sm text-foreground/80 leading-relaxed font-semibold">
                  {insight}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-6 space-y-4">
              <div className="p-3 rounded-full bg-violet-500/10 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400">
                <Terminal className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-[280px]">
                <p className="text-sm font-bold text-foreground">Operational Intelligence</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Run standard heuristics to analyze live student check-ins, LMS grade books, and calendar parameters.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={generateInsight}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                Scan Directory
              </Button>
            </div>
          )}
        </CardContent>
      </div>

      {insight && !loading && (
        <CardContent className="pb-4 pt-0">
          <div className="h-px bg-violet-100 dark:bg-zinc-800/60 my-3" />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
            <span>MODEL: GEMINI-2.5-PRO</span>
            <span>STATUS: SYNCHRONIZED</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
