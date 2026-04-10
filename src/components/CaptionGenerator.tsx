import { useState } from "react";
import { MessageSquareText, Copy, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GeneratedPost } from "@/types/post";
import { motion, AnimatePresence } from "framer-motion";

interface Caption {
  platform: string;
  caption: string;
}

interface Props {
  post: GeneratedPost;
}

const platformIcons: Record<string, string> = {
  Instagram: "📸",
  LinkedIn: "💼",
  "Twitter/X": "🐦",
};

const CaptionGenerator = ({ post }: Props) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = async () => {
    setIsGenerating(true);
    setIsOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-captions", {
        body: { headline: post.headline, subtext: post.subtext, cta: post.cta },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCaptions(data.captions || []);
    } catch {
      toast.error("Failed to generate captions");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCaption = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Caption copied!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-border text-foreground hover:bg-secondary"
        onClick={generate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquareText className="h-4 w-4" />
        )}
        Captions
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 z-50 w-80 sm:w-96 glass-strong rounded-xl p-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-foreground">AI Captions</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {isGenerating ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Generating captions...</span>
              </div>
            ) : captions.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {captions.map((c, i) => (
                  <div key={i} className="rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {platformIcons[c.platform] || "📱"} {c.platform}
                      </span>
                      <button
                        onClick={() => copyCaption(c.caption, i)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedIdx === i ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{c.caption}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Click "Captions" to generate</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CaptionGenerator;
