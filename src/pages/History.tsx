import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowLeft, Loader2, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";

interface SavedPost {
  id: string;
  template_id: string;
  template_name: string;
  format: string;
  keywords: string | null;
  headline: string;
  subtext: string;
  cta: string;
  colors: { bg: string; text: string; accent: string; ctaBg: string };
  layout: string;
  font_style: string;
  created_at: string;
}

const History = () => {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("saved_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load history");
    else setPosts(data as unknown as SavedPost[]);
    setLoading(false);
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("saved_posts").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
    }
  };

  const reEdit = (post: SavedPost) => {
    // Navigate to home with post data in state
    navigate("/", {
      state: {
        reEdit: {
          headline: post.headline,
          subtext: post.subtext,
          cta: post.cta,
          colors: post.colors,
          layout: post.layout,
          fontStyle: post.font_style,
        },
        templateId: post.template_id,
        format: post.format,
        keywords: post.keywords,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-2xl font-bold text-foreground">Post History</h2>
          <span className="text-sm text-muted-foreground">({posts.length} posts)</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-5xl">📭</span>
            <p className="text-muted-foreground">No posts in history yet. Generate and save your first one!</p>
            <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">
              Create a Post
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass group relative overflow-hidden rounded-xl"
                >
                  <div
                    className="flex flex-col items-center justify-center gap-2 p-6"
                    style={{ backgroundColor: post.colors.bg, minHeight: 180 }}
                  >
                    <h3
                      className="whitespace-pre-line text-center text-lg font-bold leading-tight"
                      style={{ color: post.colors.text }}
                    >
                      {post.headline}
                    </h3>
                    <p className="text-xs opacity-70" style={{ color: post.colors.text }}>
                      {post.subtext.slice(0, 60)}...
                    </p>
                    <span
                      className="mt-1 rounded px-3 py-1 text-xs font-bold uppercase"
                      style={{ backgroundColor: post.colors.ctaBg, color: post.colors.text }}
                    >
                      {post.cta}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.template_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()} · {post.format}
                      </p>
                      {post.keywords && (
                        <p className="mt-1 text-xs text-muted-foreground truncate max-w-[150px]">
                          🔑 {post.keywords}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => reEdit(post)}
                        className="text-muted-foreground hover:text-primary"
                        title="Re-edit"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePost(post.id)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
