
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function FloatingNav() {
  const { canGoBack, canGoForward, goBack, goForward, navigate } = useNavigation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const showNav = () => {
      setIsVisible(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsVisible(false), 3000);
    };

    const handleScroll = () => showNav();
    const handleTouch = () => showNav();

    // Show on scroll or touch
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouch);

    // Show initially
    showNav();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouch);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 right-6 z-50 md:hidden"
        >
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-lg border rounded-full shadow-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={!canGoBack}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="h-10 w-10 rounded-full"
            >
              <Home className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goForward}
              disabled={!canGoForward}
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
