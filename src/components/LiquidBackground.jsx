import React from 'react';
import { motion } from 'framer-motion';

export const moodGradients = {
  highEnergy: 'linear-gradient(45deg, #fcd34d, #ea580c, #ec4899)',
  calm: 'linear-gradient(45deg, #1e1b4b, #4338ca, #3b82f6)',
  low: 'linear-gradient(45deg, #0f172a, #334155, #64748b)',
  loved: 'linear-gradient(45deg, #be123c, #fb7185, #f43f5e)',
  default: 'linear-gradient(45deg, #09090b, #18181b, #27272a)'
};

export const themeGradients = {
  nicole: {
    highEnergy: 'linear-gradient(45deg, #fce7f3, #fbcfe8, #f472b6)', 
    calm: 'linear-gradient(45deg, #fff1f2, #fecdd3, #fbcfe8)',
    low: 'linear-gradient(45deg, #fbcfe8, #f9a8d4, #f472b6)',
    loved: 'linear-gradient(135deg, #fdf2f8, #fce7f3, #fbcfe8, #fda4af)',
    default: 'linear-gradient(45deg, #fff1f2, #fce7f3, #fbcfe8)' // Pure Pastel Pink
  },
  santiago: {
    highEnergy: 'linear-gradient(45deg, #0ea5e9, #2563eb, #1e3a8a)',
    calm: 'linear-gradient(45deg, #020617, #0f172a, #1d4ed8)',
    low: 'linear-gradient(45deg, #7f1d1d, #450a0a, #020617)',
    loved: 'linear-gradient(45deg, #991b1b, #dc2626, #b91c1c)',
    default: 'linear-gradient(45deg, #0f172a, #1e3a8a, #7f1d1d)' // Deep Blue & Crimson Red
  }
};

const LiquidBackground = ({ mood = 'default', theme = 'default' }) => {
  const getGradient = () => {
    if (themeGradients[theme] && themeGradients[theme][mood]) {
      return themeGradients[theme][mood];
    }
    return moodGradients[mood];
  };

  return (
      <motion.div
        className="fixed inset-0 z-[-1] transition-all duration-1000 ease-in-out"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, background: getGradient() }}
        transition={{ duration: 1.5 }}
      >
      <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
      }}></div>
      
      {/* Animated blob 1 */}
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full blur-3xl mix-blend-screen opacity-50 bg-white/20"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ top: '10%', left: '10%' }}
      />
      
      {/* Animated blob 2 */}
      <motion.div
        className="absolute w-[70vw] h-[70vw] rounded-full blur-3xl mix-blend-screen opacity-50 bg-black/20"
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ bottom: '10%', right: '10%' }}
      />
    </motion.div>
  );
};

export default LiquidBackground;
