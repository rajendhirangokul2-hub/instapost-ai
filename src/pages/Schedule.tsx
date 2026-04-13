import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Trash2, CheckCircle2, Clock, CalendarDays, LayoutGrid, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import Header from "@/components/Header";
import ScheduleCalendar from "@/components/ScheduleCalendar";

interface ScheduledPost {
  id: string;
  template_name: string;
  format: string;
  headline: string;
  subtext: string;
  cta: string;
  colors: { bg: string; text: string; accent: string; ctaBg: string };
  scheduled_at: string;
  platform: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const platformIcons: Record<string, string> = {
  instagram: "📸",
  linkedin: "💼",
  twitter: "🐦",
  facebook: "📘",
};

const Schedule = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("scheduled_posts")
      .select("*")
      .order("scheduled_at", { ascending: true });
    if (error) toast.error("Failed to load scheduled posts");
    else setPosts(data as unknown as ScheduledPost[]);
    setLoading(false);
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("scheduled_posts").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Scheduled post removed");
    }
  };

  const markPosted = async (id: string) => {
    const { error } = await supabase
      .from("scheduled_posts")
      .update({ status: "posted" })
      .eq("id", id);
    if (error) toast.error("Failed to update");
    else {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: "posted" } : p));
      toast.success("Marked as posted!");
    }
  };

  const upcoming = posts.filter((p) => p.status === "scheduled" && !isPast(new Date(p.scheduled_at)));
  const overdue = posts.filter((p) => p.status === "scheduled" && isPast(new Date(p.scheduled_at)));
  const posted = posts.filter((p) => p.status === "posted");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-2xl font-bold text-foreground">Scheduled Posts</h2>
          <span className="text-sm text-muted-foreground">({posts.length} total)</span>
          <div className="ml-auto flex gap-1">
            <Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === "calendar" ? "default" : "outline"} size="icon" onClick={() => setView("calendar")}>
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-5xl">📅</span>
            <p className="text-muted-foreground">No scheduled posts yet. Generate a post and schedule it!</p>
            <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">
              Create a Post
            </Button>
          </div>
        ) : view === "calendar" ? (
          <ScheduleCalendar posts={posts} onPostUpdated={fetchPosts} />
        ) : (
          <div className="space-y-8">
            {/* Overdue */}
            {overdue.length > 0 && (
              <Section title="⚠️ Ready to Post" subtitle="These are due — post them now!" posts={overdue} onDelete={deletePost} onMarkPosted={markPosted} isOverdue />
            )}
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <Section title="📅 Upcoming" subtitle="Scheduled for later" posts={upcoming} onDelete={deletePost} onMarkPosted={markPosted} />
            )}
            {/* Posted */}
            {posted.length > 0 && (
              <Section title="✅ Posted" subtitle="Completed" posts={posted} onDelete={deletePost} onMarkPosted={markPosted} isPosted />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

interface SectionProps {
  title: string;
  subtitle: string;
  posts: ScheduledPost[];
  onDelete: (id: string) => void;
  onMarkPosted: (id: string) => void;
  isOverdue?: boolean;
  isPosted?: boolean;
}

const Section = ({ title, subtitle, posts, onDelete, onMarkPosted, isOverdue, isPosted }: SectionProps) => (
  <div>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {posts.map((post) => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`glass relative overflow-hidden rounded-xl ${isOverdue ? "ring-2 ring-yellow-500/50" : ""} ${isPosted ? "opacity-70" : ""}`}
          >
            <div
              className="flex flex-col items-center justify-center gap-2 p-4"
              style={{ backgroundColor: post.colors.bg, minHeight: 120 }}
            >
              <h4
                className="whitespace-pre-line text-center text-sm font-bold leading-tight"
                style={{ color: post.colors.text }}
              >
                {post.headline}
              </h4>
              <p className="text-xs opacity-70" style={{ color: post.colors.text }}>
                {post.subtext.slice(0, 40)}...
              </p>
            </div>

            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <span className={`font-medium ${isOverdue ? "text-yellow-500" : "text-foreground"}`}>
                  {format(new Date(post.scheduled_at), "MMM d, yyyy 'at' p")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{platformIcons[post.platform] || "📱"} {post.platform}</span>
                <span>·</span>
                <span>{post.template_name}</span>
              </div>
              {post.notes && (
                <p className="text-xs text-muted-foreground italic">📝 {post.notes}</p>
              )}

              <div className="flex gap-1 pt-1">
                {!isPosted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkPosted(post.id)}
                    className="flex-1 gap-1 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Posted
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(post.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

export default Schedule;
