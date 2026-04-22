import React from 'react';
import { motion } from 'framer-motion';
import { Battery, Brain, Heart, Clock } from 'lucide-react';

const timeAgo = (timestamp) => {
  if (!timestamp) return 'Hace un momento';
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return 'Justo ahora';
  if (mins < 60) return `Hace ${mins} m`;
  const hrs = Math.floor(mins / 60);
  return `Hace ${hrs} h`;
};

const VibeCard = ({ state, isPartner, userTitle, profile }) => {
  if (!state) {
    return (
      <div className="vibe-card flex flex-col items-center justify-center p-8 text-center h-64 border-dashed border-white/20">
        <Heart className="text-white/20 mb-4" size={48} />
        <h3 className="text-white/50 font-medium">Aún no hay 'Vibe Card'</h3>
        <p className="text-white/30 text-sm mt-2">Realiza un check-in para ver el estado.</p>
      </div>
    );
  }

  const { energy, mental, needs, timestamp } = state;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden vibe-card h-80 flex flex-col"
    >
      {/* Decorative gradients */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl mix-blend-overlay pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-black/10 rounded-full blur-3xl mix-blend-overlay pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            {isPartner ? `El estado de ${profile?.partnerName || 'tu Pareja'}` : 'Mi Estado'}
          </h3>
          <p className="text-white/60 text-sm font-medium mt-1">
            {userTitle || (isPartner ? 'Vibe actual' : 'Vibe actual')}
          </p>
        </div>
        <div className="bg-white/10 rounded-full px-3 py-1 flex items-center shadow-inner border border-white/5 gap-1.5 backdrop-blur-md">
           <Clock size={12} className="text-white/70" />
           <span className="text-xs font-semibold text-white/90 uppercase tracking-widest">{timeAgo(timestamp)}</span>
        </div>
      </div>

      {/* Content grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-black/20 rounded-2xl p-4 flex flex-col justify-center border border-black/10">
          <div className="flex items-center gap-2 mb-2 text-white/50 uppercase tracking-wider text-xs font-semibold">
            <Battery size={14} /> Energía
          </div>
          <div className="text-lg font-medium text-white capitalize">{energy || '---'}</div>
        </div>
        
        <div className="bg-black/20 rounded-2xl p-4 flex flex-col justify-center border border-black/10">
          <div className="flex items-center gap-2 mb-2 text-white/50 uppercase tracking-wider text-xs font-semibold">
            <Brain size={14} /> Mente
          </div>
          <div className="text-lg font-medium text-white capitalize">{mental || '---'}</div>
        </div>

        <div className="col-span-2 bg-black/20 rounded-2xl p-4 flex flex-col justify-center border border-black/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none" />
           <div className="flex items-center gap-2 mb-2 text-white/50 uppercase tracking-wider text-xs font-semibold relative z-10">
            <Heart size={14} /> Necesidad Actual
          </div>
          <div className="text-xl font-semibold text-white capitalize relative z-10">
            {needs || '---'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VibeCard;
