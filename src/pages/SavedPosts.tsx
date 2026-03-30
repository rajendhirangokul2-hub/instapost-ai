import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";

interface SavedPost {
  id: string;
  template_name: string;
  format: string;
  headline: string;
  subtext: string;
  cta: string;
  colors: { bg: string; text: string; accent: string; ctaBg: string };
  layout: string;
  font_style: string;
  created_at: string;
}

const SavedPosts = () => {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("saved_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load saved posts");
    } else {
      setPosts(data as SavedPost[]);
    }
    setLoading(false);
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("saved_posts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete post");
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-2xl font-bold text-foreground">Saved Posts</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-5xl">📭</span>
            <p className="text-muted-foreground">No saved posts yet. Generate and save your first one!</p>
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
                  {/* Mini preview */}
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
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{post.template_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()} · {post.format}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePost(post.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default SavedPosts;
