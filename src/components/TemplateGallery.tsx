import { motion } from "framer-motion";
import { templates, categoryLabels, categoryIcons } from "@/lib/templates";
import { Template, TemplateCategory } from "@/types/post";
import { useState } from "react";

interface Props {
  selected: Template | null;
  onSelect: (t: Template) => void;
}

const categories: Array<TemplateCategory | "all"> = ["all", "business", "sale", "event", "education", "food", "fitness"];

const TemplateGallery = ({ selected, onSelect }: Props) => {
  const [filter, setFilter] = useState<TemplateCategory | "all">("all");

  const filtered = filter === "all" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-semibold text-foreground">Choose a Template</h2>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              filter === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat === "all" ? "All" : `${categoryIcons[cat]} ${categoryLabels[cat]}`}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((template, i) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(template)}
            className={`group relative flex flex-col items-center gap-2 rounded-xl p-4 text-left transition-all ${
              selected?.id === template.id
                ? "surface-elevated ring-2 ring-primary glow-primary"
                : "surface-elevated hover:ring-1 hover:ring-border"
            }`}
          >
            <span className="text-3xl">{template.preview}</span>
            <span className="text-center text-sm font-medium text-foreground">{template.name}</span>
            <span className="text-center text-xs text-muted-foreground">{template.description}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;
