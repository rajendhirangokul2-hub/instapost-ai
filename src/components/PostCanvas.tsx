import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Loader2, Bookmark, Undo2, Redo2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedPost, SocialFormat } from "@/types/post";
import { useRef, useEffect } from "react";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import InlineEdit from "@/components/InlineEdit";
import ColorPicker from "@/components/ColorPicker";
import FontPicker, { FontStyle } from "@/components/FontPicker";
import { useHistory } from "@/hooks/useHistory";

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

const fontFamilyMap: Record<string, string | undefined> = {
  elegant: "'Space Grotesk'",
  serif: "Georgia, serif",
  mono: "monospace",
};

const fontClassMap: Record<string, string> = {
  bold: "font-bold text-2xl sm:text-4xl",
  elegant: "font-light text-2xl sm:text-4xl tracking-tight",
  playful: "font-semibold text-xl sm:text-3xl",
  mono: "font-mono font-medium text-xl sm:text-3xl",
  serif: "font-semibold text-2xl sm:text-4xl",
};

const PostCanvas = ({ post, format, isGenerating, templateId, templateName, keywords }: Props) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { state: current, set, reset, undo, redo, canUndo, canRedo } = useHistory<GeneratedPost>(null);

  useEffect(() => { reset(post); }, [post, reset]);

  const update = (field: keyof GeneratedPost, value: any) => {
    if (!current) return;
    set({ ...current, [field]: value });
  };

  const downloadFile = (dataUrl: string, ext: string) => {
    const link = document.createElement("a");
    link.download = `postai-${format}-${Date.now()}.${ext}`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownload = async (type: "png" | "jpg" | "svg" | "pdf" = "png") => {
    if (!canvasRef.current) return;
    try {
      const opts = { pixelRatio: 2 };
      if (type === "png") {
        downloadFile(await toPng(canvasRef.current, opts), "png");
      } else if (type === "jpg") {
        downloadFile(await toJpeg(canvasRef.current, { ...opts, quality: 0.95 }), "jpg");
      } else if (type === "svg") {
        downloadFile(await toSvg(canvasRef.current, opts), "svg");
      } else if (type === "pdf") {
        const imgData = await toPng(canvasRef.current, opts);
        const el = canvasRef.current;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const pdf = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "px", format: [w, h] });
        pdf.addImage(imgData, "PNG", 0, 0, w, h);
        pdf.save(`postai-${format}-${Date.now()}.pdf`);
      }
      toast.success(`Post downloaded as ${type.toUpperCase()}!`);
    } catch {
      toast.error("Failed to download. Try again.");
    }
  };

  const handleSave = async () => {
    if (!user) { toast.error("Sign in to save posts"); return; }
    if (!current || !templateId) return;

    const { error } = await supabase.from("saved_posts").insert({
      user_id: user.id,
      template_id: templateId,
      template_name: templateName || "Unknown",
      format,
      keywords: keywords || "",
      headline: current.headline,
      subtext: current.subtext,
      cta: current.cta,
      colors: current.colors as any,
      layout: current.layout,
      font_style: current.fontStyle,
    });

    if (error) toast.error("Failed to save post");
    else toast.success("Post saved!");
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
          ) : current ? (
            <motion.div
              key="post"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              ref={canvasRef}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl"
              style={{ backgroundColor: current.colors.bg }}
            >
              <div
                className="absolute top-0 left-0 h-1.5 w-full"
                style={{ backgroundColor: current.colors.accent }}
              />
              <div
                className={`flex flex-1 flex-col gap-5 w-full ${
                  current.layout === "centered"
                    ? "items-center justify-center text-center"
                    : current.layout === "left-aligned"
                    ? "items-start justify-center text-left"
                    : "items-start justify-end text-left"
                }`}
              >
                <InlineEdit
                  value={current.headline}
                  onChange={(v) => update("headline", v)}
                  multiline
                  className={`whitespace-pre-line leading-tight ${fontClassMap[current.fontStyle] || fontClassMap.bold}`}
                  style={{
                    color: current.colors.text,
                    fontFamily: fontFamilyMap[current.fontStyle] || "inherit",
                  }}
                />
                <InlineEdit
                  value={current.subtext}
                  onChange={(v) => update("subtext", v)}
                  multiline
                  className="max-w-md text-sm sm:text-base leading-relaxed opacity-85"
                  style={{ color: current.colors.text }}
                />
                <InlineEdit
                  value={current.cta}
                  onChange={(v) => update("cta", v)}
                  className="mt-2 rounded-lg px-6 py-2.5 text-sm font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: current.colors.ctaBg,
                    color: current.colors.bg === "#FFFFFF" || current.colors.bg === "#FAFAF9" || current.colors.bg === "#FEF3C7" || current.colors.bg === "#FFF1F2" || current.colors.bg === "#ECFDF5" || current.colors.bg === "#F0F9FF"
                      ? "#FFFFFF"
                      : current.colors.text,
                  }}
                />
              </div>
              <div
                className="absolute bottom-3 right-4 text-xs font-medium opacity-30"
                style={{ color: current.colors.text }}
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

      {current && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="gap-1 border-border text-foreground hover:bg-secondary disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="gap-1 border-border text-foreground hover:bg-secondary disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <ColorPicker colors={current.colors} onChange={(c) => update("colors", c)} />
          <FontPicker value={current.fontStyle} onChange={(v) => update("fontStyle", v as FontStyle)} />
          <Button onClick={handleDownload} size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border text-foreground hover:bg-secondary"
            onClick={handleSave}
          >
            <Bookmark className="h-4 w-4" /> Save
          </Button>
          <Button
            variant="outline"
            size="sm"
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
