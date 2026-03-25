import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import TemplateGallery from "@/components/TemplateGallery";
import GeneratePanel from "@/components/GeneratePanel";
import PostCanvas from "@/components/PostCanvas";
import { Template, SocialFormat, GeneratedPost } from "@/types/post";
import { generatePost } from "@/lib/generate";
import { toast } from "sonner";

const Index = () => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [keywords, setKeywords] = useState("");
  const [format, setFormat] = useState<SocialFormat>("instagram");
  const [generated, setGenerated] = useState<GeneratedPost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!template) {
      toast.error("Please select a template first");
      return;
    }
    setIsGenerating(true);
    try {
      const post = await generatePost(template, keywords);
      setGenerated(post);
      toast.success("Post generated successfully!");
    } catch {
      toast.error("Generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-10 text-center"
      >
        <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-5xl">
          Create Stunning Posts
          <br />
          <span className="gradient-text">In One Click</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Select a template, customize your keywords, and let AI generate a professional social media post instantly.
        </p>
      </motion.section>

      {/* Main Layout */}
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* Left Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
            <div className="glass rounded-2xl p-5">
              <TemplateGallery selected={template} onSelect={setTemplate} />
            </div>
            <div className="glass rounded-2xl p-5">
              <GeneratePanel
                template={template}
                keywords={keywords}
                onKeywordsChange={setKeywords}
                format={format}
                onFormatChange={setFormat}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                hasGenerated={!!generated}
              />
            </div>
          </div>

          {/* Right Canvas */}
          <div className="flex items-start justify-center pt-4">
            <div className="w-full max-w-2xl">
              <PostCanvas post={generated} format={format} isGenerating={isGenerating} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
