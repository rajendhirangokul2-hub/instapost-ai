import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Loader2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedPost, SocialFormat } from "@/types/post";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  post: GeneratedPost | null;
  format: SocialFormat;
  isGenerating: boolean;
  templateId?: string;
  templateName?: string;
  keywords?: string;
}

const aspectRatios: Record<SocialFormat, string> = {
  instagram: "aspect-square",
  linkedin: "aspect-[1200/627]",
  twitter: "aspect-[1200/675]",
};

const PostCanvas = ({ post, format, isGenerating, templateId, templateName, keywords }: Props) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `postai-${format}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Post downloaded successfully!");
    } catch {
      toast.error("Failed to download. Try again.");
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Sign in to save posts");
      return;
    }
    if (!post || !templateId) return;

    const { error } = await supabase.from("saved_posts").insert({
      user_id: user.id,
      template_id: templateId,
      template_name: templateName || "Unknown",
      format,
      keywords: keywords || "",
      headline: post.headline,
      subtext: post.subtext,
      cta: post.cta,
      colors: post.colors as any,
      layout: post.layout,
      font_style: post.fontStyle,
    });

    if (error) {
      toast.error("Failed to save post");
    } else {
      toast.success("Post saved!");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`w-full max-w-lg ${aspectRatios[format]} relative overflow-hidden rounded-xl`}>
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 surface-elevated rounded-xl"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-display text-sm font-medium text-muted-foreground">AI is crafting your post...</p>
            </motion.div>
          ) : post ? (
            <motion.div
              key="post"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              ref={canvasRef}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl"
              style={{ backgroundColor: post.colors.bg }}
            >
              <div
                className="absolute top-0 left-0 h-1.5 w-full"
                style={{ backgroundColor: post.colors.accent }}
              />
              <div
                className={`flex flex-1 flex-col gap-5 w-full ${
                  post.layout === "centered"
                    ? "items-center justify-center text-center"
                    : post.layout === "left-aligned"
                    ? "items-start justify-center text-left"
                    : "items-start justify-end text-left"
                }`}
              >
                <h2
                  className={`whitespace-pre-line leading-tight ${
                    post.fontStyle === "bold"
                      ? "font-bold text-2xl sm:text-4xl"
                      : post.fontStyle === "elegant"
                      ? "font-light text-2xl sm:text-4xl tracking-tight"
                      : "font-semibold text-xl sm:text-3xl"
                  }`}
                  style={{
                    color: post.colors.text,
                    fontFamily: post.fontStyle === "elegant" ? "'Space Grotesk'" : "inherit",
                  }}
                >
                  {post.headline}
                </h2>
                <p
                  className="max-w-md text-sm sm:text-base leading-relaxed opacity-85"
                  style={{ color: post.colors.text }}
                >
                  {post.subtext}
                </p>
                <button
                  className="mt-2 rounded-lg px-6 py-2.5 text-sm font-bold uppercase tracking-wide transition-transform hover:scale-105"
                  style={{
                    backgroundColor: post.colors.ctaBg,
                    color: post.colors.bg === "#FFFFFF" || post.colors.bg === "#FAFAF9" || post.colors.bg === "#FEF3C7" || post.colors.bg === "#FFF1F2" || post.colors.bg === "#ECFDF5" || post.colors.bg === "#F0F9FF"
                      ? "#FFFFFF"
                      : post.colors.text,
                  }}
                >
                  {post.cta}
                </button>
              </div>
              <div
                className="absolute bottom-3 right-4 text-xs font-medium opacity-30"
                style={{ color: post.colors.text }}
              >
                PostAI
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 surface-elevated rounded-xl border border-dashed border-border"
            >
              <span className="text-4xl">🎨</span>
              <p className="font-display text-sm text-muted-foreground">
                Your generated post will appear here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {post && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <Button onClick={handleDownload} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" /> Download PNG
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-border text-foreground hover:bg-secondary"
            onClick={handleSave}
          >
            <Bookmark className="h-4 w-4" /> Save
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-border text-foreground hover:bg-secondary"
            onClick={() => toast.info("Sharing coming soon!")}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default PostCanvas;
