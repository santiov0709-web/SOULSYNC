import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Image as ImageIcon, Loader2, Mic, Square, Trash2 } from 'lucide-react';
import { playSound } from '../utils/audio';
import { uploadFile } from '../utils/sync';

const Chat = ({ messages, onSendMessage, partnerName, profile, coupleTopic, theme }) => {
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    onSendMessage({ text: inputText });
    setInputText('');
    playSound('pop');
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      playSound('pop');
      
      const uploadData = await uploadFile(coupleTopic, file);
      
      if (uploadData.attachment) {
        onSendMessage({ 
          text: `📸 Foto enviada`, 
          image: uploadData.attachment.url,
          attachment: uploadData.attachment 
        });
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      alert('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- Voice Note Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) return;

        const audioFile = new File([audioBlob], "voice_note.webm", { type: 'audio/webm' });
        
        try {
          setIsUploading(true);
          const uploadData = await uploadFile(coupleTopic, audioFile);
          if (uploadData.attachment) {
            onSendMessage({ 
              text: `🎤 Nota de voz`, 
              audio: uploadData.attachment.url 
            });
          }
        } catch (error) {
          console.error("Audio upload error:", error);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      playSound('pop');
      
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Necesitas dar permiso al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      playSound('pop');
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[65dvh] safe-bottom bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
            theme === 'nicole' ? 'bg-gradient-to-tr from-pink-500 to-purple-500' : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
          }`}>
            {partnerName[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{partnerName}</h3>
            <span className="text-green-400 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> En línea
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30 text-center px-8">
            <Smile size={48} className="mb-4 opacity-20" />
            <p className="text-sm px-4">¡Dile algo tierno a {partnerName}! Tu mensaje llegará al instante.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === profile.myName;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-lg ${
                    isMe 
                    ? (theme === 'santiago' 
                        ? 'bg-gradient-to-br from-indigo-600 to-blue-500 text-white rounded-tr-none' 
                        : 'bg-gradient-to-br from-pink-600 to-pink-500 text-white rounded-tr-none'
                      ) 
                    : 'bg-white/10 text-white border border-white/10 rounded-tl-none backdrop-blur-md'
                  }`}
                >
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Shared" 
                      className="rounded-lg mb-2 max-w-full h-auto cursor-pointer"
                      onClick={() => window.open(msg.image, '_blank')}
                    />
                  )}
                  {msg.audio && (
                    <div className="mb-2 min-w-[200px] bg-black/20 rounded-xl p-2">
                      <audio 
                        src={msg.audio} 
                        controls 
                        className="w-full h-8 brightness-110 contrast-125"
                      />
                    </div>
                  )}
                  <p className="leading-relaxed font-outfit">{msg.text}</p>
                  <span className={`text-[9px] mt-1 block opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        <button 
          type="button" 
          onClick={handleFileClick}
          disabled={isUploading || isRecording}
          className="text-white/30 hover:text-white/60 p-2 transition-colors disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
        </button>
        
        {isRecording ? (
          <div className="flex-1 flex items-center gap-3 bg-red-500/10 rounded-full px-4 py-2 border border-red-500/20">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-mono">{formatDuration(recordingDuration)}</span>
            <span className="text-red-400/50 text-[10px] animate-pulse">Grabando...</span>
          </div>
        ) : (
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isUploading}
            placeholder="Escribe un mensaje de amor..."
            className={`flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-white text-sm focus:outline-none transition-colors disabled:opacity-50 ${
              theme === 'nicole' ? 'focus:border-pink-500/50' : 'focus:border-blue-500/50'
            }`}
          />
        )}
        
        {inputText.trim() || isUploading ? (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!inputText.trim() || isUploading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              inputText.trim() 
              ? (theme === 'nicole' 
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                )
              : 'bg-white/5 text-white/20'
            }`}
          >
            <Send size={18} />
          </motion.button>
        ) : (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isRecording 
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
              : 'bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            {isRecording ? <Square size={18} /> : <Mic size={18} />}
          </motion.button>
        )}
      </form>
    </div>
  );
};

export default Chat;
