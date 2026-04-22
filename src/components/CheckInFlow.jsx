import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BatteryCharging, BatteryMedium, BatteryLow, Brain, Compass, Coffee, Heart, Maximize, MessageCircle, ArrowRight } from 'lucide-react';
import { playSound } from '../utils/audio';

const questions = [
  {
    id: 'energy',
    title: '¿Cómo está tu energía hoy?',
    options: [
      { id: 'alta', label: 'Alta', icon: BatteryCharging, color: 'text-yellow-400', moodMap: 'highEnergy' },
      { id: 'media', label: 'Media', icon: BatteryMedium, color: 'text-blue-400', moodMap: 'calm' },
      { id: 'baja', label: 'Baja', icon: BatteryLow, color: 'text-slate-400', moodMap: 'low' },
    ]
  },
  {
    id: 'mental',
    title: '¿Cómo se siente tu mente?',
    options: [
      { id: 'enfocada', label: 'Enfocada', icon: Compass, color: 'text-emerald-400', moodMap: 'highEnergy' },
      { id: 'en_paz', label: 'En paz', icon: Heart, color: 'text-pink-400', moodMap: 'loved' },
      { id: 'dispersa', label: 'Dispersa', icon: Brain, color: 'text-purple-400', moodMap: 'low' },
      { id: 'agotada', label: 'Agotada', icon: Coffee, color: 'text-orange-400', moodMap: 'low' },
    ]
  },
  {
    id: 'needs',
    title: '¿Qué necesitas ahora mismo?',
    options: [
      { id: 'un_abrazo', label: 'Un abrazo', icon: Heart, color: 'text-red-400', moodMap: 'loved' },
      { id: 'espacio', label: 'Espacio', icon: Maximize, color: 'text-cyan-400', moodMap: 'calm' },
      { id: 'hablar', label: 'Hablar un rato', icon: MessageCircle, color: 'text-green-400', moodMap: 'highEnergy' },
      { id: 'descanso', label: 'Descansar', icon: Coffee, color: 'text-blue-300', moodMap: 'low' },
    ]
  }
];

const CheckInFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ energy: null, mental: null, needs: null });
  const [moodPoints, setMoodPoints] = useState({ highEnergy: 0, calm: 0, low: 0, loved: 0 });

  const currentQ = questions[step];

  const handleSelect = (option) => {
    playSound('pop');
    
    // Update Answers
    const newAnswers = { ...answers, [currentQ.id]: option.label };
    setAnswers(newAnswers);

    // Update Mood Weightings
    const newMoodPoints = { ...moodPoints };
    newMoodPoints[option.moodMap] += 1;
    setMoodPoints(newMoodPoints);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Calculate final mood
      let finalMood = 'default';
      let maxScore = -1;
      Object.entries(newMoodPoints).forEach(([m, score]) => {
        if (score > maxScore) {
          maxScore = score;
          finalMood = m;
        }
      });

      setTimeout(() => {
        onComplete({
          ...newAnswers,
          mood: finalMood,
          timestamp: Date.now()
        });
      }, 400);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto pb-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="mb-8">
            <span className="text-white/50 text-sm font-semibold tracking-wider uppercase mb-2 block">
              Paso {step + 1} de {questions.length}
            </span>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg leading-tight">
              {currentQ.title}
            </h2>
          </div>

          <div className="grid gap-4">
            {currentQ.options.map((option) => {
              const Icon = option.icon;
              const isSelected = answers[currentQ.id] === option.label;
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelect(option)}
                  className={`
                    flex items-center p-5 rounded-2xl border transition-all duration-300 w-full text-left
                    ${isSelected 
                      ? 'bg-white/20 border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'}
                    backdrop-blur-md haptic-active
                  `}
                >
                  <div className={`p-3 rounded-full bg-slate-900/40 mr-4 ${option.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-lg font-medium text-white/90">{option.label}</span>
                  {isSelected && (
                    <motion.div 
                      layoutId="check-indicator"
                      className="ml-auto text-white"
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CheckInFlow;
