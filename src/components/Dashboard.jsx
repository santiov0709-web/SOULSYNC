import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VibeCard from './VibeCard';
import NudgeSystem from './NudgeSystem';
import Chat from './Chat';
import { User, Users, MessageCircle, Share } from 'lucide-react';
import { playSound } from '../utils/audio';

const Dashboard = ({ userState, partnerState, setPartnerState, profile, theme, coupleTopic, chatMessages, onSendMessage }) => {
  const [activeTab, setActiveTab] = useState('mine'); // 'mine', 'partner', or 'chat'

  const handleTabChange = (tab) => {
    playSound('pop');
    setActiveTab(tab);
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full pb-10">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-black/20 rounded-full mb-6 backdrop-blur-md border border-white/5 shadow-inner">
        <button
          onClick={() => handleTabChange('mine')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-full text-xs font-medium transition-all duration-300 haptic-active ${
            activeTab === 'mine' 
              ? 'bg-white/20 text-white shadow-lg border border-white/20' 
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <User size={14} /> Yo
        </button>
        <button
          onClick={() => handleTabChange('partner')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-full text-xs font-medium transition-all duration-300 haptic-active ${
            activeTab === 'partner' 
              ? 'bg-white/20 text-white shadow-lg border border-white/20' 
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <Users size={14} /> {profile?.partnerName || 'Pareja'}
        </button>
        <button
          onClick={() => handleTabChange('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-full text-xs font-medium transition-all duration-300 haptic-active ${
            activeTab === 'chat' 
              ? 'bg-white/20 text-white shadow-lg border border-white/20' 
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          <MessageCircle size={14} /> Chat
        </button>
      </div>

      <div className="relative w-full z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'mine' ? (
            <motion.div
              key="tab-me"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <VibeCard state={userState} isPartner={false} userTitle={profile?.myName} profile={profile} />
              
              <button 
                onClick={() => {
                  playSound('pop');
                  const link = `${window.location.origin}/?pe=${userState.energy}&pm=${userState.mental}&pn=${userState.needs}&pmo=${userState.mood}`;
                  const msg = `He actualizado mi estado en SoulSync ✨. \n\nToca aquí para ver cómo me siento y sincronizarnos automáticamente:\n${link}`;
                  window.location.href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
                }}
                className="mt-6 w-full bg-white/20 hover:bg-white/30 border border-white/30 py-4 rounded-3xl font-bold text-white flex justify-center items-center gap-2 haptic-active shadow-xl transition-all"
              >
                <Share size={20} /> Enviar mi Vibe por WhatsApp
              </button>
            </motion.div>
          ) : activeTab === 'partner' ? (
            <motion.div
              key="tab-partner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col gap-6"
            >
              <VibeCard state={partnerState} isPartner={true} userTitle={profile?.partnerName} profile={profile} />
              
              {/* Nudge / Interaction Module */}
              <div className="mt-8">
                <NudgeSystem partnerState={partnerState} profile={profile} coupleTopic={coupleTopic} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tab-chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col pt-2"
            >
              <Chat 
                messages={chatMessages} 
                onSendMessage={onSendMessage} 
                partnerName={profile?.partnerName || 'Pareja'}
                profile={profile}
                coupleTopic={coupleTopic}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
