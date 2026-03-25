import { GeneratedPost, Template } from "@/types/post";

const contentByCategory: Record<string, GeneratedPost[]> = {
  business: [
    {
      headline: "Elevate Your Business\nTo New Heights",
      subtext: "Strategic solutions that drive growth, innovation, and lasting success for forward-thinking companies.",
      cta: "Get Started Today →",
      colors: { bg: "#0F172A", text: "#F8FAFC", accent: "#3B82F6", ctaBg: "#2563EB" },
      layout: "centered",
      fontStyle: "bold",
    },
    {
      headline: "Transform Your\nDigital Presence",
      subtext: "We craft powerful brand experiences that connect, engage, and convert your ideal audience.",
      cta: "Book a Free Consultation",
      colors: { bg: "#FAFAF9", text: "#1C1917", accent: "#EA580C", ctaBg: "#DC2626" },
      layout: "left-aligned",
      fontStyle: "elegant",
    },
  ],
  sale: [
    {
      headline: "MEGA SALE\n50% OFF",
      subtext: "Limited time only! Grab the best deals before they're gone. Don't miss out on incredible savings.",
      cta: "SHOP NOW 🛒",
      colors: { bg: "#7C3AED", text: "#FFFFFF", accent: "#FDE047", ctaBg: "#FACC15" },
      layout: "centered",
      fontStyle: "bold",
    },
    {
      headline: "End of Season\nClearance",
      subtext: "Up to 70% off on selected items. Premium quality at unbeatable prices.",
      cta: "Browse Collection →",
      colors: { bg: "#FEF3C7", text: "#451A03", accent: "#D97706", ctaBg: "#B45309" },
      layout: "left-aligned",
      fontStyle: "elegant",
    },
  ],
  event: [
    {
      headline: "Innovation\nSummit 2026",
      subtext: "Join 500+ industry leaders for two days of insights, networking, and breakthrough ideas.",
      cta: "Reserve Your Spot",
      colors: { bg: "#020617", text: "#E2E8F0", accent: "#06B6D4", ctaBg: "#0891B2" },
      layout: "centered",
      fontStyle: "bold",
    },
    {
      headline: "Creative\nWorkshop Series",
      subtext: "Hands-on sessions to unlock your creative potential. Limited seats available.",
      cta: "Register Free →",
      colors: { bg: "#FFF1F2", text: "#1F2937", accent: "#E11D48", ctaBg: "#BE123C" },
      layout: "split",
      fontStyle: "playful",
    },
  ],
  education: [
    {
      headline: "Master AI &\nMachine Learning",
      subtext: "Industry-certified course with hands-on projects. Learn from experts and land your dream role.",
      cta: "Enroll Now — Free Trial",
      colors: { bg: "#0C4A6E", text: "#F0F9FF", accent: "#38BDF8", ctaBg: "#0284C7" },
      layout: "centered",
      fontStyle: "bold",
    },
    {
      headline: "5 Productivity\nTips That Work",
      subtext: "Science-backed strategies to 10x your output. Transform how you work and live.",
      cta: "Read More →",
      colors: { bg: "#ECFDF5", text: "#064E3B", accent: "#10B981", ctaBg: "#059669" },
      layout: "left-aligned",
      fontStyle: "elegant",
    },
  ],
  food: [
    {
      headline: "Taste the\nDifference",
      subtext: "Farm-to-table dining experience with locally sourced ingredients and chef-curated menus.",
      cta: "Reserve a Table 🍽️",
      colors: { bg: "#1C1917", text: "#FEF3C7", accent: "#F59E0B", ctaBg: "#D97706" },
      layout: "centered",
      fontStyle: "elegant",
    },
  ],
  fitness: [
    {
      headline: "YOUR BODY.\nYOUR RULES.",
      subtext: "Personalized training programs designed to push your limits and achieve real results.",
      cta: "Start Free Trial 💪",
      colors: { bg: "#18181B", text: "#FAFAFA", accent: "#EF4444", ctaBg: "#DC2626" },
      layout: "centered",
      fontStyle: "bold",
    },
  ],
};

export function generatePost(template: Template, keywords: string): Promise<GeneratedPost> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const options = contentByCategory[template.category] || contentByCategory.business;
      const selected = { ...options[Math.floor(Math.random() * options.length)] };

      // Incorporate keywords if provided
      if (keywords.trim()) {
        selected.subtext = selected.subtext.replace(
          /\./,
          `. Perfect for ${keywords}.`
        );
      }

      resolve(selected);
    }, 1500 + Math.random() * 1000);
  });
}
