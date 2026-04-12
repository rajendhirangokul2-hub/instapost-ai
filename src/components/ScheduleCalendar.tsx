import { useState } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, addMonths, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScheduledPost {
  id: string;
  headline: string;
  platform: string;
  scheduled_at: string;
  status: string;
  colors: { bg: string; text: string; accent: string; ctaBg: string };
}

const platformIcons: Record<string, string> = {
  instagram: "📸", linkedin: "💼", twitter: "🐦", facebook: "📘",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduleCalendar({ posts }: { posts: ScheduledPost[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => isSameDay(new Date(p.scheduled_at), day));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((d) => (
          <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        <TooltipProvider>
          {days.map((day) => {
            const dayPosts = getPostsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`relative min-h-[72px] rounded-md border p-1 transition-colors ${
                  isCurrentMonth ? "border-border bg-background" : "border-transparent bg-muted/30"
                } ${isToday ? "ring-2 ring-primary/50" : ""}`}
              >
                <span className={`text-xs ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"}`}>
                  {format(day, "d")}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayPosts.slice(0, 3).map((p) => (
                    <Tooltip key={p.id}>
                      <TooltipTrigger asChild>
                        <div
                          className="cursor-default truncate rounded px-1 text-[10px] font-medium leading-tight"
                          style={{ backgroundColor: p.colors.bg, color: p.colors.text }}
                        >
                          {platformIcons[p.platform] || "📱"} {p.headline.slice(0, 12)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs font-semibold">{p.headline}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(p.scheduled_at), "p")} · {p.platform} · {p.status}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {dayPosts.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
