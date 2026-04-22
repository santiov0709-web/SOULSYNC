import React, { useState, useEffect } from 'react';
import LiquidBackground from './components/LiquidBackground';
import { loadState, saveState } from './utils/storage';
import CheckInFlow from './components/CheckInFlow';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import { Share2, RefreshCw, Heart, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from './utils/audio';
import { getCoupleTopic, publishState, subscribeToPartner, requestNotificationPermission, sendLocalNotification, fetchLatestState, fetchChatHistory } from './utils/sync';

function App() {
  const [profile, setProfile] = useState(
    loadState('soulsync_profile', { myName: '', partnerName: '' })
  );
  const [view, setView] = useState(() => {
    const savedProfile = loadState('soulsync_profile', null);
    if (!savedProfile || !savedProfile.myName || !savedProfile.partnerName) {
      return 'onboarding';
    }
    return 'dashboard'; // Default to dashboard if we already have a profile
  });
  const [userState, setUserState] = useState(
    loadState('soulsync_user_state', null)
  );
  const [partnerState, setPartnerState] = useState(
    loadState('soulsync_partner_state', {
      mood: 'low', 
      energy: 'baja',
      needs: 'un abrazo',
      timestamp: Date.now() - 3600000 
    })
  );

  const [currentMood, setCurrentMood] = useState('default');
  const [chatMessages, setChatMessages] = useState(
    loadState('soulsync_chat', [])
  );

  const getTheme = (name) => {
    if (!name) return 'default';
    const n = name.toLowerCase().trim();
    if (n.includes('nicole') || n.includes('niña')) return 'nicole';
    if (n.includes('santiago') || n.includes('santi') || n.includes('snt')) return 'santiago';
    return 'default';
  };

  const [notificationEnabled, setNotificationEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );
  
  const currentTheme = getTheme(profile?.myName);

  const coupleTopic = React.useMemo(() => {
    if (profile.myName && profile.partnerName) {
      return getCoupleTopic(profile.myName, profile.partnerName);
    }
    return null;
  }, [profile.myName, profile.partnerName]);

  useEffect(() => {
    // Initial fetch from Supabase to ensure persistence
    if (!coupleTopic) return;

    const loadInitialData = async () => {
      // Fetch latest state
      const latestState = await fetchLatestState(coupleTopic);
      if (latestState) {
        setPartnerState(latestState);
        saveState('soulsync_partner_state', latestState);
      }

      // Fetch chat history
      const history = await fetchChatHistory(coupleTopic);
      if (history.length > 0) {
        setChatMessages(history);
        saveState('soulsync_chat', history);
      }
    };

    loadInitialData();

    // Re-sync when the app becomes visible again (returned from background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App visible again, re-syncing...');
        loadInitialData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [coupleTopic]);

  useEffect(() => {
    // Real-time Sync Logic (Ntfy)
    if (!coupleTopic) return;

    const unsubscribe = subscribeToPartner(coupleTopic, (receivedState) => {
      // If the message is from our partner
      if (receivedState.sender !== profile.myName) {
        saveState('soulsync_partner_state', receivedState);
        playSound('sparkle');
        
        if (receivedState.type === 'nudge') {
          sendLocalNotification(`SoulSync de ${profile.partnerName}`, receivedState.message);
          playSound('heartbeat');
        } else if (receivedState.type === 'chat') {
          const msgSignature = `${receivedState.sender}_${receivedState.text}_${receivedState.timestamp}`;
          
          setChatMessages(prev => {
            // Check if message already exists in the last few messages
            const isDuplicate = prev.some(m => `${m.sender}_${m.text}_${m.timestamp}` === msgSignature);
            if (isDuplicate) return prev;

            const newMsg = { 
              sender: receivedState.sender, 
              text: receivedState.text, 
              image: receivedState.image,
              audio: receivedState.audio,
              timestamp: receivedState.timestamp || Date.now() 
            };
            const updated = [...prev.slice(-49), newMsg];
            saveState('soulsync_chat', updated);
            return updated;
          });
          
          sendLocalNotification(`Chat de ${profile.partnerName}`, receivedState.text);
        } else if (receivedState.type === 'status') {
          setPartnerState(receivedState);
          saveState('soulsync_partner_state', receivedState);
          sendLocalNotification(`Estado de ${profile.partnerName}`, `${profile.partnerName} ha actualizado su mood.`);
          playSound('sparkle');
        } else {
          // Legacy status update (no type field)
          setPartnerState(receivedState);
          saveState('soulsync_partner_state', receivedState);
        }
      }
    });

    return unsubscribe;
  }, [coupleTopic, profile.myName, profile.partnerName, view]);

  useEffect(() => {
    // URL Pseudo-Sync Logic (legacy support)
    const params = new URLSearchParams(window.location.search);
    const pe = params.get('pe');
    const pm = params.get('pm');
    const pn = params.get('pn');
    const pmo = params.get('pmo');

    if (pe && pm && pn && pmo) {
      const newPartnerState = { energy: pe, mental: pm, needs: pn, mood: pmo, timestamp: Date.now() };
      setPartnerState(newPartnerState);
      saveState('soulsync_partner_state', newPartnerState);
      playSound('sparkle');
      window.history.replaceState({}, document.title, window.location.pathname);
      setView('dashboard');
    }
  }, []);

  useEffect(() => {
    if (view === 'checkin') {
      setCurrentMood('default');
    } else if (userState) {
      setCurrentMood(userState.mood || 'calm');
    }
  }, [view, userState]);

  const handleOnboardingComplete = (data) => {
    playSound('pop');
    setProfile(data);
    saveState('soulsync_profile', data);
    setView('checkin');
  };

  const handleCheckInComplete = (data) => {
    playSound('sparkle');
    const enrichedData = { type: 'status', ...data, sender: profile.myName, timestamp: Date.now() };
    setUserState(enrichedData);
    saveState('soulsync_user_state', enrichedData);
    
    // Publish to cloud
    if (coupleTopic) {
      publishState(coupleTopic, enrichedData);
    }
    
    setView('dashboard');
  };

  const handleSendMessage = (messageData) => {
    const newMsg = { sender: profile.myName, ...messageData, timestamp: Date.now() };
    setChatMessages(prev => {
      const updated = [...prev.slice(-49), newMsg];
      saveState('soulsync_chat', updated);
      return updated;
    });

    if (coupleTopic) {
      publishState(coupleTopic, { type: 'chat', ...newMsg });
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
    if (granted) playSound('sparkle');
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col font-sans theme-${currentTheme}`}>
      <LiquidBackground mood={currentMood} theme={currentTheme} />
      
      <main className="flex-1 w-full max-w-md mx-auto relative z-10 px-4 py-8 flex flex-col pt-12">
        {/* Header - hide on onboarding */}
        {view !== 'onboarding' && (
          <header className="flex justify-between items-center mb-8">
            <div className="flex-col flex">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white/90">SoulSync</h1>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <Heart 
                    size={20} 
                    className={currentTheme === 'nicole' ? 'text-pink-500 fill-pink-500' : 'text-blue-500 fill-blue-500'} 
                  />
                </motion.div>
              </div>
              <span className="text-white/50 text-xs font-semibold uppercase tracking-widest mt-1">Hola, {profile?.myName || 'Usuario'}</span>
            </div>
            {userState && view === 'dashboard' && (
             <div className="flex items-center gap-4">
                <button 
                  onClick={handleRequestPermission}
                  className={`flex items-center gap-1.5 transition-colors text-sm font-medium haptic-active ${notificationEnabled ? 'text-green-400' : 'text-white/40 hover:text-white/60'}`}
                  title={notificationEnabled ? 'Notificaciones activadas' : 'Activar notificaciones'}
                >
                  <Bell size={14} fill={notificationEnabled ? 'currentColor' : 'none'} /> 
                  {notificationEnabled ? 'Activo' : 'Avisos'}
                </button>
                <button 
                  onClick={() => {
                    playSound('pop');
                    navigator.clipboard.writeText(window.location.href);
                    alert('¡Link copiado!');
                  }}
                  className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm font-medium haptic-active"
                >
                  <Share2 size={14} /> App Link
                </button>
               <button 
                 onClick={() => {
                   playSound('pop');
                   setView('checkin');
                 }}
                 className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white/90 hover:text-white transition-all text-sm font-medium haptic-active shadow-lg"
               >
                 <RefreshCw size={14} /> Actualizar
               </button>
             </div>
          )}
        </header>
        )}
        <div className="flex-1 flex flex-col">
          {view === 'onboarding' ? (
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : view === 'checkin' ? (
            <CheckInFlow onComplete={handleCheckInComplete} />
          ) : (
            <Dashboard 
              userState={userState} 
              partnerState={partnerState} 
              setPartnerState={setPartnerState}
              profile={profile}
              theme={currentTheme}
              coupleTopic={coupleTopic}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
