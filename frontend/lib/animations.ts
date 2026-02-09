/**
 * Animation presets using framer-motion
 * Provides consistent animations throughout the app
 */

// Fade in animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Slide up animation
export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: { duration: 0.3 },
};

// Slide in from right
export const slideInRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
  transition: { duration: 0.3 },
};

// Scale in animation
export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.2 },
};

// Stagger children for list animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Stagger item for list items
export const staggerItem = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.3 },
};

// Hover effect for cards
export const cardHover = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Pulse animation
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Shake animation for errors
export const shake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
  },
  transition: {
    duration: 0.5,
  },
};

// Spin animation
export const spin = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};

// Bounce animation
export const bounce = {
  animate: {
    y: [0, -20, 0],
  },
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Layout animation for smooth reordering
export const layout = {
  layout: true,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
};
