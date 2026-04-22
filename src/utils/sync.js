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
    
    if (error) {
      console.error('Supabase write error. Checking fallback.', error.message);
      // Fallback a ntfy si hay un error de conexión
      fetch(`${NTFY_BASE_URL}/${topic}`, {
        method: 'POST',
        body: JSON.stringify(state)
      }).catch(() => {});
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
      icon: '/favicon.ico', // Adjust if needed
    });
  }
};
