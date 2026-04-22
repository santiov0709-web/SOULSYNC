import { supabase } from './supabase';
const NTFY_BASE_URL = 'https://ntfy.sh';

/**
 * Generates a consistent but unique topic name based on the couple's identity.
 */
export const getCoupleTopic = (myName, partnerName) => {
  // Normalize names: remove accents, spaces, and non-alphanumeric chars
  const cleanName = (name) => 
    name.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]/g, '');      // Only alphanumeric

  const names = [cleanName(myName), cleanName(partnerName)].sort();
  // Using a v2 string to guarantee we start fresh with the new topic format
  const secretKey = `soulsync_${names.join('_')}_v2`;
  return secretKey;
};

/**
 * Sends the current state to the partner via ntfy.sh
 */
export const publishState = async (topic, state) => {
  try {
    const payload = {
      topic,
      sender: state.sender || 'system',
      type: state.type || 'status',
      payload: state
    };
    
    const { error } = await supabase.from('messages').insert([payload]);
    
    // --- Instant Broadcast ---
    // Enviar también por canal de broadcast para que llegue al instante sin esperar a la DB
    supabase.channel(`room_${topic}`).send({
      type: 'broadcast',
      event: 'message',
      payload: state,
    });
    
    if (error) {
      console.error('Supabase write error. Checking fallback.', error.message);
      // Fallback a ntfy si hay un error de conexión
      fetch(`${NTFY_BASE_URL}/${topic}`, {
        method: 'POST',
        body: JSON.stringify(state)
      }).catch(() => {});
    }

    // --- Background "Beeper" ---
    // Enviar un ping a ntfy para despertar notificaciones en segundo plano
    if (state.type === 'chat' || state.type === 'nudge') {
      const pushTopic = `${topic}_push`;
      fetch(`${NTFY_BASE_URL}/${pushTopic}`, {
        method: 'POST',
        body: state.text || 'Tienes una nueva interacción en SoulSync ✨',
        headers: {
          'Title': `SoulSync: ${state.sender}`,
          'Tags': state.type === 'chat' ? 'speech_balloon' : 'sparkles',
          'Priority': 'high',
          'Click': window.location.origin
        }
      }).catch(err => console.log('Beeper silent', err));
    }
  } catch (error) {
    console.error('Failed to publish state:', error);
  }
};

/**
 * Uploads a file as an attachment to ntfy.sh
 */
export const uploadFile = async (topic, file) => {
  try {
    const response = await fetch(`${NTFY_BASE_URL}/${topic}`, {
      method: 'PUT',
      body: file,
      headers: {
        'Filename': file.name,
      }
    });
    const data = await response.json();
    return data; // Returns attachment details if successful
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

/**
 * Subscribes to changes from the partner
 */
export const subscribeToPartner = (topic, onMessage) => {
  let fallbackEventSource = null;

  const channel = supabase
    .channel(`room_${topic}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `topic=eq.${topic}` }, 
      (payload) => {
        if (payload.new && payload.new.payload) {
          onMessage(payload.new.payload);
        }
      }
    )
    .on('broadcast', { event: 'message' }, (payload) => {
      if (payload.payload) {
        onMessage(payload.payload);
      }
    })
    .subscribe((status) => {
      // Activar un event source alternativo solo si la conexión falla (como mecanismo de seguridad fuerte)
      if (status === 'SUBSCRIBED') {
         if (fallbackEventSource) { fallbackEventSource.close(); fallbackEventSource = null; }
      }
    });

  return () => {
    supabase.removeChannel(channel);
    if (fallbackEventSource) fallbackEventSource.close();
  };
};

/**
 * Fetches the most recent state and chat messages from Supabase
 */
export const fetchLatestState = async (topic) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('payload')
      .eq('topic', topic)
      .eq('type', 'status')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data[0]?.payload || null;
  } catch (error) {
    console.error('Error fetching latest state:', error);
    return null;
  }
};

export const fetchChatHistory = async (topic, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('payload')
      .eq('topic', topic)
      .eq('type', 'chat')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    // Reverse to get chronological order
    return data.map(item => item.payload).reverse();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

/**
 * Requests notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Shows a native notification
 */
export const sendLocalNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon.png', // Corrected path
    });
  }
};

/**
 * Enables true background notifications using ntfy's Web Push integration
 */
export const enableBackgroundNotifications = async (topic) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Background notifications not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // ntfy.sh uses a specific pattern for Web Push
    // We can just open their "subscribe" page or use their API
    // The easiest "Pro" way is to use a direct subscription to their push endpoint
    const pushTopic = `${topic}_push`;
    
    // Triggering the ntfy.sh subscription popup/logic
    // This is a known pro trick for ntfy + pwa
    const subUrl = `${NTFY_BASE_URL}/${pushTopic}/subscribe?webapp=1`;
    const subWindow = window.open(subUrl, 'ntfy_subscribe', 'width=400,height=500');
    
    return subWindow;
  } catch (error) {
    console.error('Error enabling background notifications:', error);
  }
};
