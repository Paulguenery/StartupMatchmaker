import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingAnimationProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingAnimation({ 
  message = "Recherche en cours...", 
  size = "md" 
}: LoadingAnimationProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const rippleVariants = {
    initial: { scale: 0.1, opacity: 1 },
    animate: { 
      scale: 2,
      opacity: 0,
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="relative">
        {/* Effets de vague */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            initial="initial"
            animate="animate"
            variants={rippleVariants}
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}

        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="relative z-10"
        >
          <Loader2 className={`${sizes[size]} text-primary animate-pulse`} />
        </motion.div>
      </div>

      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.p 
          className="text-muted-foreground text-sm text-center"
          animate={{
            opacity: [0.5, 1, 0.5],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {message}
        </motion.p>
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary/10"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ 
            scaleX: [0, 1, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      </motion.div>
    </motion.div>
  );
}