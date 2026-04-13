import { useState, useCallback } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScheduledPost {
  id: string;
  headline: string;
  platform: string;
  scheduled_at: string;
  status: string;
  colors: { bg: string; text: string; accent: string; ctaBg: string };
}

type CalendarView = "month" | "week";

const platformIcons: Record<string, string> = {
  instagram: "📸", linkedin: "💼", twitter: "🐦", facebook: "📘",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  posts: ScheduledPost[];
  onPostUpdated?: () => void;
}

export default function ScheduleCalendar({ posts, onPostUpdated }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calView, setCalView] = useState<CalendarView>("month");
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);

  const getDays = () => {
    if (calView === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });
  };

  const days = getDays();

  const navigate = (dir: -1 | 1) => {
    if (calView === "week") {
      setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else {
      setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => isSameDay(new Date(p.scheduled_at), day));

  const handleDragStart = (postId: string) => {
    setDraggedPostId(postId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = useCallback(async (e: React.DragEvent, targetDay: Date) => {
    e.preventDefault();
    if (!draggedPostId) return;

    const post = posts.find((p) => p.id === draggedPostId);
    if (!post) return;

    // Keep original time, change the date
    const original = new Date(post.scheduled_at);
    const newDate = new Date(targetDay);
    newDate.setHours(original.getHours(), original.getMinutes(), original.getSeconds());

    const { error } = await supabase
      .from("scheduled_posts")
      .update({ scheduled_at: newDate.toISOString() })
      .eq("id", draggedPostId);

    if (error) {
      toast.error("Failed to reschedule post");
    } else {
      toast.success(`Rescheduled to ${format(newDate, "MMM d, yyyy")}`);
      onPostUpdated?.();
    }
    setDraggedPostId(null);
  }, [draggedPostId, posts, onPostUpdated]);

  const headerLabel = calView === "week"
    ? `${format(startOfWeek(currentDate), "MMM d")} – ${format(endOfWeek(currentDate), "MMM d, yyyy")}`
    : format(currentDate, "MMMM yyyy");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-lg font-semibold text-foreground">{headerLabel}</h3>
          <div className="flex gap-1">
            <Button
              variant={calView === "month" ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setCalView("month")}
            >
              Month
            </Button>
            <Button
              variant={calView === "week" ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setCalView("week")}
            >
              Week
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((d) => (
          <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        <TooltipProvider>
          {days.map((day) => {
            const dayPosts = getPostsForDay(day);
            const isCurrentMonth = calView === "week" || isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const minH = calView === "week" ? "min-h-[140px]" : "min-h-[72px]";
            const maxPosts = calView === "week" ? 6 : 3;

            return (
              <div
                key={day.toISOString()}
                className={`relative ${minH} rounded-md border p-1 transition-colors ${
                  isCurrentMonth ? "border-border bg-background" : "border-transparent bg-muted/30"
                } ${isToday ? "ring-2 ring-primary/50" : ""} ${
                  draggedPostId ? "hover:bg-primary/10" : ""
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                <span className={`text-xs ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"}`}>
                  {calView === "week" ? format(day, "EEE d") : format(day, "d")}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayPosts.slice(0, maxPosts).map((p) => (
                    <Tooltip key={p.id}>
                      <TooltipTrigger asChild>
                        <div
                          draggable
                          onDragStart={() => handleDragStart(p.id)}
                          className="cursor-grab truncate rounded px-1 text-[10px] font-medium leading-tight active:cursor-grabbing"
                          style={{ backgroundColor: p.colors.bg, color: p.colors.text }}
                        >
                          {platformIcons[p.platform] || "📱"} {p.headline.slice(0, calView === "week" ? 20 : 12)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs font-semibold">{p.headline}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(p.scheduled_at), "p")} · {p.platform} · {p.status}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">Drag to reschedule</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {dayPosts.length > maxPosts && (
                    <span className="text-[10px] text-muted-foreground">+{dayPosts.length - maxPosts} more</span>
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
