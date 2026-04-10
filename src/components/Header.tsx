import { motion } from "framer-motion";
import { Sparkles, LogIn, LogOut, BookmarkCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-strong sticky top-0 z-50 px-6 py-4"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Post<span className="text-primary">AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/shops")}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">My Shops</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/saved")}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <BookmarkCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Saved</span>
              </Button>
              <span className="hidden text-sm text-muted-foreground sm:block">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 border-border text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth")}
              className="gap-2 border-border text-muted-foreground"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
