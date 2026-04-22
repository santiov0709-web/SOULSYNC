import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Sparkles, ArrowRight } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [myName, setMyName] = useState('');
  const [partnerName, setPartnerName] = useState('');

  const handleNext = () => {
    if (step === 1 && myName.trim()) {
      setStep(2);
    } else if (step === 2 && partnerName.trim()) {
      onComplete({ myName: myName.trim(), partnerName: partnerName.trim() });
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto pb-16 px-4">
      <div className="text-center mb-12">
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ type: 'spring', stiffness: 200, damping: 20 }}
           className="bg-white/10 p-4 rounded-full inline-block mb-4 shadow-xl border border-white/20"
        >
          <Sparkles className="text-white/90" size={32} />
        </motion.div>
        <h1 className="text-4xl font-bold text-white drop-shadow-lg tracking-tight">SoulSync</h1>
        <p className="text-white/60 mt-2 text-sm font-medium">Sincronizando sus almas</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-6">¿Cómo quieres que te llamen?</h2>
            <div className="relative mb-8">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input 
                type="text" 
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="Tu nombre..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all font-medium text-lg shadow-inner"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
            <button 
              onClick={handleNext}
              disabled={!myName.trim()}
              className="w-full bg-white text-slate-900 font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all haptic-active shadow-xl"
            >
              Continuar <ArrowRight size={20} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-6">¿Cómo se llama tu persona especial?</h2>
            <div className="relative mb-8">
              <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400/70" />
              <input 
                type="text" 
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Su nombre..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:bg-white/20 transition-all font-medium text-lg shadow-inner"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
            <button 
              onClick={handleNext}
              disabled={!partnerName.trim()}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all haptic-active shadow-xl"
            >
              Empezar <Heart fill="currentColor" size={20} />
            </button>
            <button 
              onClick={() => setStep(1)}
              className="w-full mt-4 text-white/50 hover:text-white/80 font-medium text-sm transition-colors py-2"
            >
              Volver
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
