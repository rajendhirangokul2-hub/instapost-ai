import { Template } from "@/types/post";

export const templates: Template[] = [
  {
    id: "biz-modern",
    name: "Modern Business",
    category: "business",
    preview: "💼",
    description: "Clean, professional look for corporate announcements",
  },
  {
    id: "biz-startup",
    name: "Startup Vibe",
    category: "business",
    preview: "🚀",
    description: "Bold and energetic for tech startups",
  },
  {
    id: "sale-flash",
    name: "Flash Sale",
    category: "sale",
    preview: "⚡",
    description: "Eye-catching sale promotions with urgency",
  },
  {
    id: "sale-seasonal",
    name: "Seasonal Offer",
    category: "sale",
    preview: "🎁",
    description: "Festive and seasonal discount posts",
  },
  {
    id: "event-conference",
    name: "Conference",
    category: "event",
    preview: "🎤",
    description: "Professional event announcements",
  },
  {
    id: "event-workshop",
    name: "Workshop",
    category: "event",
    preview: "🎓",
    description: "Interactive workshop and class promos",
  },
  {
    id: "edu-course",
    name: "Online Course",
    category: "education",
    preview: "📚",
    description: "Educational content and course launches",
  },
  {
    id: "edu-tips",
    name: "Tips & Tricks",
    category: "education",
    preview: "💡",
    description: "Informative tip cards and how-tos",
  },
  {
    id: "food-restaurant",
    name: "Restaurant",
    category: "food",
    preview: "🍽️",
    description: "Delicious food promotions and menus",
  },
  {
    id: "fitness-gym",
    name: "Gym & Fitness",
    category: "fitness",
    preview: "💪",
    description: "Motivational fitness and health posts",
  },
  {
    id: "offer-discount",
    name: "Special Offer",
    category: "offer",
    preview: "🎯",
    description: "Compelling discount and deal posts",
  },
  {
    id: "opening-grand",
    name: "Grand Opening",
    category: "opening",
    preview: "🎊",
    description: "Celebrate new store or branch launches",
  },
  {
    id: "festival-celebration",
    name: "Festival",
    category: "festival",
    preview: "🎉",
    description: "Festive greetings and seasonal celebrations",
  },
];

export const categoryLabels: Record<string, string> = {
  business: "Business",
  sale: "Sale & Offers",
  event: "Events",
  education: "Education",
  food: "Food & Dining",
  fitness: "Fitness & Health",
  offer: "Offers",
  opening: "Opening",
  festival: "Festival",
};

export const categoryIcons: Record<string, string> = {
  business: "💼",
  sale: "🏷️",
  event: "📅",
  education: "📖",
  food: "🍕",
  fitness: "🏋️",
  offer: "🎯",
  opening: "🎊",
  festival: "🎉",
};
