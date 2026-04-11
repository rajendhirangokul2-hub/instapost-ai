import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GeneratedPost } from "@/types/post";
import { toast } from "sonner";

interface Props {
  post: GeneratedPost;
  templateId?: string;
  templateName?: string;
  format: string;
  keywords?: string;
}

const platforms = [
  { value: "instagram", label: "📸 Instagram" },
  { value: "linkedin", label: "💼 LinkedIn" },
  { value: "twitter", label: "🐦 Twitter/X" },
  { value: "facebook", label: "📘 Facebook" },
];

const ScheduleDialog = ({ post, templateId, templateName, format: postFormat, keywords }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [platform, setPlatform] = useState(postFormat);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSchedule = async () => {
    if (!user) { toast.error("Sign in to schedule posts"); return; }
    if (!date) { toast.error("Please pick a date"); return; }
    if (!templateId) { toast.error("No template selected"); return; }

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    if (scheduledAt <= new Date()) {
      toast.error("Scheduled time must be in the future");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("scheduled_posts").insert({
      user_id: user.id,
      template_id: templateId,
      template_name: templateName || "Unknown",
      format: postFormat,
      keywords: keywords || "",
      headline: post.headline,
      subtext: post.subtext,
      cta: post.cta,
      colors: post.colors as any,
      layout: post.layout,
      font_style: post.fontStyle,
      scheduled_at: scheduledAt.toISOString(),
      platform,
      notes: notes || null,
      status: "scheduled",
    });

    setSaving(false);
    if (error) {
      toast.error("Failed to schedule post");
    } else {
      toast.success(`Post scheduled for ${format(scheduledAt, "PPP 'at' p")}`);
      setOpen(false);
      setDate(undefined);
      setTime("12:00");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border text-foreground hover:bg-secondary"
        >
          <CalendarPlus className="h-4 w-4" /> Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Schedule Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Mini preview */}
          <div
            className="rounded-lg p-4 text-center"
            style={{ backgroundColor: post.colors.bg, minHeight: 80 }}
          >
            <p className="text-sm font-bold" style={{ color: post.colors.text }}>
              {post.headline.split("\n")[0]}
            </p>
            <p className="mt-1 text-xs opacity-70" style={{ color: post.colors.text }}>
              {post.subtext.slice(0, 50)}...
            </p>
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Time</label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Notes (optional)</label>
            <Textarea
              placeholder="Add any reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSchedule}
            disabled={saving || !date}
            className="w-full gap-2 bg-primary text-primary-foreground"
          >
            {saving ? "Scheduling..." : "Schedule Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;
