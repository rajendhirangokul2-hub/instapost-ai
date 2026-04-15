import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Loader2, Bookmark, Undo2, Redo2, ChevronDown } from "lucide-react";
import CaptionGenerator from "@/components/CaptionGenerator";
import ScheduleDialog from "@/components/ScheduleDialog";
import { Button } from "@/components/ui/button";
import { GeneratedPost, SocialFormat } from "@/types/post";
import { useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode-react";
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
  showQr?: boolean;
  qrValue?: string;
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

const PostCanvas = ({ post, format, isGenerating, templateId, templateName, keywords, showQr, qrValue }: Props) => {
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

  const isLightBg = (hex: string) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
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
              className="absolute inset-0 flex flex-col rounded-xl overflow-hidden"
              style={{ backgroundColor: current.colors.bg }}
            >
              {/* Accent bar */}
              <div className="h-1.5 w-full flex-shrink-0" style={{ backgroundColor: current.colors.accent }} />

              {/* Main content area */}
              <div
                className={`flex flex-1 flex-col px-8 sm:px-10 pt-6 sm:pt-8 pb-16 ${
                  current.layout === "centered"
                    ? "items-center justify-center text-center"
                    : current.layout === "left-aligned"
                    ? "items-start justify-center text-left"
                    : "items-start justify-end text-left"
                }`}
                style={{ gap: 0 }}
              >
                {/* HEADLINE */}
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

                {/* SUBHEADLINE */}
                {current.subheadline && (
                  <InlineEdit
                    value={current.subheadline}
                    onChange={(v) => update("subheadline", v)}
                    className="mt-2 text-sm sm:text-base font-medium opacity-75"
                    style={{ color: current.colors.text }}
                  />
                )}

                {/* DESCRIPTION */}
                <InlineEdit
                  value={current.subtext}
                  onChange={(v) => update("subtext", v)}
                  multiline
                  className="mt-3 max-w-md text-xs sm:text-sm leading-relaxed opacity-85"
                  style={{ color: current.colors.text }}
                />

                {/* OFFER */}
                {current.offer && (
                  <div
                    className="mt-3 rounded-md px-4 py-1.5 text-sm sm:text-base font-bold tracking-wide"
                    style={{
                      backgroundColor: current.colors.accent,
                      color: isLightBg(current.colors.accent) ? "#1a1a1a" : "#ffffff",
                    }}
                  >
                    <InlineEdit
                      value={current.offer}
                      onChange={(v) => update("offer", v)}
                      style={{ color: "inherit" }}
                    />
                  </div>
                )}

                {/* CTA */}
                <InlineEdit
                  value={current.cta}
                  onChange={(v) => update("cta", v)}
                  className="mt-4 rounded-lg px-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: current.colors.ctaBg,
                    color: isLightBg(current.colors.ctaBg) ? "#1a1a1a" : "#ffffff",
                  }}
                />

                {/* BUSINESS DETAILS BLOCK */}
                {(current.businessName || current.address || current.phone) && (
                  <div
                    className="mt-4 rounded-md px-4 py-2 text-xs sm:text-[11px] leading-relaxed opacity-80"
                    style={{
                      color: current.colors.text,
                      backgroundColor: `${current.colors.text}10`,
                    }}
                  >
                    {current.businessName && (
                      <div className="font-bold text-xs sm:text-sm">{current.businessName}</div>
                    )}
                    {current.address && <div>📍 {current.address}</div>}
                    {current.phone && <div>📞 {current.phone}</div>}
                  </div>
                )}
              </div>

              {/* QR Code + QR Text */}
              {showQr && qrValue && (
                <div className="absolute bottom-3 left-4 flex items-end gap-2">
                  <div className="rounded-md bg-white p-1.5">
                    <QRCodeSVG value={qrValue} size={48} level="M" />
                  </div>
                  {current.qrText && (
                    <span
                      className="text-[9px] font-medium opacity-60 max-w-[100px] leading-tight"
                      style={{ color: current.colors.text }}
                    >
                      {current.qrText}
                    </span>
                  )}
                </div>
              )}

              {/* Watermark */}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="h-4 w-4" /> Download <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownload("png")}>PNG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("jpg")}>JPG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("svg")}>SVG</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("pdf")}>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            onClick={async () => {
              if (!canvasRef.current) return;
              try {
                const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2 });
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], `postai-${format}.png`, { type: "image/png" });
                if (navigator.canShare?.({ files: [file] })) {
                  await navigator.share({ files: [file], title: "My PostAI Design" });
                } else {
                  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                  toast.success("Image copied to clipboard!");
                }
              } catch (e: any) {
                if (e?.name !== "AbortError") toast.error("Sharing failed");
              }
            }}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
          {current && <CaptionGenerator post={current} />}
          {current && templateId && (
            <ScheduleDialog post={current} templateId={templateId} templateName={templateName} format={format} keywords={keywords} />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PostCanvas;
