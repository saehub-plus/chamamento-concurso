import { Variants } from 'framer-motion';

// Animation variants for page transitions
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Animation variants for staggering children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animation variants for fading in elements
export const fadeIn = (delay = 0): Variants => ({
  hidden: { 
    opacity: 0,
    y: 10 
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      delay,
    },
  },
  show: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      delay,
    },
  },
});

// Animation variants for scaling elements
export const scaleVariants = {
  hidden: { 
    scale: 0.95,
    opacity: 0 
  },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
};
