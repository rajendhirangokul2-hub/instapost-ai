import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const Header = () => (
  <motion.header
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="glass-strong sticky top-0 z-50 px-6 py-4"
  >
    <div className="mx-auto flex max-w-7xl items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">
          Post<span className="text-primary">AI</span>
        </h1>
      </div>
      <p className="hidden text-sm text-muted-foreground sm:block">
        AI-Powered Social Media Post Generator
      </p>
    </div>
  </motion.header>
);

export default Header;
