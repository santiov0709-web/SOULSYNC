import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Music, Send, X, MapPin, Calendar, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { publishState } from '../utils/sync';

const DateModal = ({ isOpen, onClose, partner }) => {
  const dateIdeas = [
    { title: "Picnic bajo las estrellas", desc: "Prepara una manta y algo de comer para una noche mágica.", icon: Sparkles },
    { title: "Noche de cocina juntos", desc: "Busquen una receta nueva y prepárenla mientras escuchan música.", icon: Heart },
    { title: "Caminata al atardecer", desc: "Encuentren un lugar con buena vista y solo disfruten el camino.", icon: MapPin },
    { title: "Cine en casa temático", desc: "Elijan una saga y preparen snacks especiales.", icon: Music },
  ];
  
  const [randomDate, setRandomDate] = useState(dateIdeas[0]);
  
  const generateNew = () => {
    playSound('pop');
    setRandomDate(dateIdeas[Math.floor(Math.random() * dateIdeas.length)]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-[#1a1c2c] border border-white/20 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20}/></button>
            
            <Heart className="text-pink-500 mb-4 animate-pulse" size={40} fill="currentColor" />
            <h2 className="text-2xl font-bold text-white mb-2">Cita Sorpresa</h2>
            <p className="text-white/60 text-sm mb-6">Un plan especial para ti y {partner}</p>
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                {(() => {
                  const DateIcon = randomDate.icon;
                  return <DateIcon size={18} className="text-pink-400" />;
                })()} 
                {randomDate.title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">{randomDate.desc}</p>
            </div>

            <button 
              onClick={generateNew}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-pink-50 transition-colors mb-4"
            >
              🔄 Ver otra idea
            </button>
            <button 
              onClick={() => {
                const msg = `¡Tengo un plan! 🌹 Acabo de proponer en SoulSync una cita: "${randomDate.title}". ¿Te gusta?`;
                window.location.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
              }}
              className="w-full py-3 bg-transparent border border-white/20 text-white/80 font-medium rounded-2xl text-sm"
            >
              Enviar propuesta por WhatsApp
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NudgeSystem = ({ partnerState, profile, coupleTopic }) => {
  const [animating, setAnimating] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showMusic, setShowMusic] = useState(false);

  const triggerAnimation = () => {
    // Canvas confetti animation
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffb6ff', '#ffffbb', '#bbf6ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffb6ff', '#ffffbb', '#bbf6ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Local full screen haptic-like flash
    if ('vibrate' in navigator) navigator.vibrate(50);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 800);
  };

  const handleNudge = async (nudgeType, message) => {
    triggerAnimation();
    playSound('heartbeat');
    
    if (nudgeType === 'date') {
      setShowDateModal(true);
      return;
    }
    
    if (nudgeType === 'music') {
      setShowMusic(!showMusic);
      if (!showMusic && coupleTopic) {
        publishState(coupleTopic, { type: 'nudge', sender: profile.myName, message: `${profile.myName} está escuchando nuestra playlist romántica. 🎵` });
      }
      return;
    }

    // Publish Cloud Nudge
    if (coupleTopic) {
      publishState(coupleTopic, { type: 'nudge', sender: profile.myName, message });
    }

    setTimeout(async () => {
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.location.href = url;
    }, 500);
  };

  const partner = profile?.partnerName || 'tu pareja';
  const me = profile?.myName || 'yo';

  const nudgeOptions = [
    { 
      id: 'hug', 
      label: 'Abrazo Infinito', 
      icon: Heart, 
      color: 'text-pink-400 bg-pink-400/10 border-pink-400/20', 
      msg: `🫂 Hola ${partner}, siente este abrazo virtual que atraviesa la pantalla desde el corazón de ${me}. Te amo infinitamente.` 
    },
    { 
      id: 'love', 
      label: 'Carta Express', 
      icon: Sparkles, 
      color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', 
      msg: `✨ Nota de amor para ${partner}: Eres la luz de mis días. Te escribe ${me} solo para recordarte que eres mi persona favorita en el mundo.` 
    },
    { 
      id: 'music', 
      label: 'Playlist Romántica', 
      icon: Music, 
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', 
      msg: `🎵 Hey ${partner}, ${me} te ha dedicado esta selección especial de música para que sientas mi compañía: https://open.spotify.com/playlist/37i9dQZF1DX4pUKG1o9C9r` 
    },
    { 
      id: 'date', 
      label: 'Cita Sorpresa', 
      icon: Send, 
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', 
      msg: `🌹 ¡Hola ${partner}! ${me} tiene una idea para nuestra próxima cita... ¡Toca responder para que te cuente los planes secretos! ✨` 
    },
  ];

  const needsSupport = partnerState?.mood === 'low' || partnerState?.energy === 'baja';

  return (
    <section className="relative mt-2">
      <AnimatePresence>
        {animating && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.5, 0], opacity: [1, 0.5, 0] }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          >
            <div className="w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>

      <DateModal 
        isOpen={showDateModal} 
        onClose={() => setShowDateModal(false)} 
        partner={partner} 
      />

      <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/20 shadow-2xl relative overflow-hidden">
        {/* Magic Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 relative z-10">
          <Sparkles className="text-yellow-400" size={20} />
          Envía un Rayo de Luz
        </h3>

        {needsSupport && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-400/20 border border-yellow-400/30 rounded-2xl p-4 mb-5"
          >
            <p className="text-white text-sm leading-snug">
              ⚠️ {partner} necesita un poco de amor extra ahora. ¡Dile algo bonito!
            </p>
          </motion.div>
        )}

        {showMusic && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-4 overflow-hidden"
          >
            <iframe 
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4pUKG1o9C9r?utm_source=generator&theme=0" 
              width="100%" 
              height="152" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              className="rounded-2xl shadow-lg border border-white/10"
            />
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 relative z-10">
          {nudgeOptions.map((nudge) => {
            const NudgeIcon = nudge.icon;
            return (
              <button
                key={nudge.id}
                onClick={() => handleNudge(nudge.id, nudge.msg)}
                className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all duration-300 haptic-active active:scale-95 group hover:-translate-y-1 ${nudge.color} ${nudge.id === 'music' && showMusic ? 'ring-2 ring-purple-400 border-transparent shadow-[0_0_15px_rgba(168,85,247,0.4)]' : ''}`}
              >
                <NudgeIcon className="mb-3 transition-transform group-hover:scale-125" size={28} />
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">{nudge.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NudgeSystem;
