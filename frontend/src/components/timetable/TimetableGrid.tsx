import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Clock, User as UserIcon } from "lucide-react";
import type { schedule } from "@/types";

interface Props {
  schedule: schedule[];
  isLoading: boolean;
  onCellClick?: (day: string, time: string, period?: any) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Subject to Color Map for better visual distinction
const getSubjectColor = (subjectName: string) => {
  const colors = [
    "border-l-blue-500",
    "border-l-emerald-500",
    "border-l-violet-500",
    "border-l-amber-500",
    "border-l-rose-500",
    "border-l-cyan-500",
    "border-l-orange-500",
    "border-l-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const TimetableGrid = ({ schedule, isLoading, onCellClick }: Props) => {
  // loading
  if (isLoading) {
    return (
      <div className="h-125 w-full flex items-center justify-center border rounded-lg bg-card">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Loading schedule...</p>
        </div>
      </div>
    );
  }

  const hasAnyPeriods = useMemo(() => {
    return schedule?.some(day => day.periods && day.periods.length > 0) || false;
  }, [schedule]);

  // no schedule
  if (!schedule || schedule.length === 0 || !hasAnyPeriods) {
    return (
      <div className="h-100 w-full flex flex-col items-center justify-center border rounded-lg border-dashed bg-card mt-6">
        <Clock className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg">No Timetable Generated</h3>
        <p className="text-muted-foreground text-sm max-w-sm text-center">
          There are zero active periods found for this class in this academic year.
          Use the Generator Controls to construct a robust AI Schedule.
        </p>
      </div>
    );
  }

  const timeSlots = useMemo(() => {
    if (!schedule) return [];
    const times = new Set<string>();
    schedule.forEach((day) => {
      day.periods.forEach((period) => {
        times.add(period.startTime);
      });
    });
    //   the issue is here, we need to sort the times
    return Array.from(times).sort();
  }, [schedule]);

  const getRowLabel = (startTime: string) => {
    for (const day of schedule) {
      const found = day.periods.find((p) => p.startTime === startTime);
      if (found) {
        return `${found.startTime} - ${found.endTime}`;
      }
    }
    return startTime;
  };
  // now fix the design, next we can have generate and test
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max min-w-full flex-col">
        {/* header row */}
        <div className="flex border-b bg-muted/50">
          <div className="w-32 shrink-0 border-r p-4 font-medium text-muted-foreground flex items-center justify-center">
            Time
          </div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="flex-1 min-w-50 border-r p-4 font-semibold text-center last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        {timeSlots?.map((time) => (
          <div className="flex border-b last:border-b-0 min-h-27.5" key={time}>
            <div className="w-32 shrink-0 border-r p-2 text-xs font-medium text-muted-foreground flex items-center justify-center text-center bg-muted/50">
              {getRowLabel(time)}
            </div>
            {DAYS.map((day) => {
              // Find the day data
              const dayData = schedule.find((d) => d.day === day);

              // Find the specific period that matches THIS ROW'S start time
              const period = dayData?.periods.find((p) => p.startTime === time);
              return (
                <div
                  key={`${day}-${time}`}
                  className={`flex-1 min-w-50 border-r p-2 last:border-r-0 ${onCellClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''}`}
                  onClick={() => onCellClick?.(day, time, period)}
                >
                  {/* make sure you have subject and teacher */}
                  {period ? (
                    period.type === "break" ? (
                      <div className="h-full w-full rounded-md border border-amber-200 bg-amber-50/50 flex flex-col items-center justify-center p-2 text-center gap-1 shadow-sm border-l-4 border-l-amber-500">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/80">Interval</span>
                        <h4 className="font-bold text-xs text-amber-700">Recess / Break</h4>
                        <span className="text-[10px] font-medium text-amber-500/70">{period.startTime} - {period.endTime}</span>
                      </div>
                    ) : period.subject && period.teacher ? (
                      <div className={`h-full w-full rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-2 border-l-4 ${getSubjectColor(period.subject.name)}`}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant="outline"
                              className="font-bold text-[10px] px-1.5"
                            >
                              {period.subject.code || "SUB"}
                            </Badge>
                            {period.room && (
                              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 rounded">
                                Room: {period.room}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-sm leading-tight text-primary line-clamp-2">
                            {period.subject.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-dashed">
                          <UserIcon className="h-3 w-3 shrink-0" />
                          <span
                            className="truncate max-w-35"
                            title={period.teacher.name}
                          >
                            {period.teacher.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full rounded-md border border-dashed border-primary bg-primary/30 flex items-center justify-center">
                        <span className="text-xs text-primary font-medium">
                          Incomplete Slot
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="h-full w-full rounded-md border border-dashed border-muted bg-muted/20 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground font-medium">
                        Free Period
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default TimetableGrid;
