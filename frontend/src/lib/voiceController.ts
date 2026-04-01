type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceMessage {
  question: string;
  answer: string;
  timestamp: number;
}

class VoiceController {
  private recognition: any = null;
  private isSpeaking = false;
  private state: VoiceState = 'idle';
  private onStateChange?: (state: VoiceState) => void;
  private abortController?: AbortController;

  initialize(onStateChange: (state: VoiceState) => void) {
    this.onStateChange = onStateChange;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.stopAll();
    }
  };

  private handleWindowBlur = () => {
    this.stopAll();
  };

  private updateState(newState: VoiceState) {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  startListening(lang: string, onResult: (text: string) => void, onError: (error: string) => void) {
    if (!this.recognition || this.state !== 'idle') return;

    this.recognition.lang = lang;
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    this.recognition.onerror = (event: any) => {
      this.updateState('idle');
      if (event.error === 'not-allowed') {
        onError('Microphone permission denied');
      } else if (event.error === 'no-speech') {
        onError('No speech detected');
      } else if (event.error !== 'aborted') {
        onError(`Recognition error: ${event.error}`);
      }
    };
    this.recognition.onend = () => {
      if (this.state === 'listening') {
        this.updateState('idle');
      }
    };

    try {
      this.recognition.start();
      this.updateState('listening');
    } catch (err) {
      onError('Failed to start listening');
    }
  }

  cancelListening() {
    if (this.recognition && this.state === 'listening') {
      try {
        this.recognition.abort();
      } catch (e) {
        this.recognition.stop();
      }
      this.updateState('idle');
    }
  }

  startSpeaking(text: string, lang: string, onComplete: () => void) {
    this.stopSpeaking();
    this.isSpeaking = true;
    this.updateState('speaking');

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.split('-')[0];
    
    let voice = voices.find(v => v.lang === lang && (v.name.includes('Google') || v.name.includes('Microsoft')));
    if (!voice) voice = voices.find(v => v.lang === lang);
    if (!voice) voice = voices.find(v => v.lang.startsWith(langPrefix));
    if (!voice && langPrefix === 'hi') voice = voices.find(v => v.name.toLowerCase().includes('hindi'));

    if (text.length > 150) {
      this.speakChunks(text, voice, lang, onComplete);
    } else {
      this.speakSingle(text, voice, lang, onComplete);
    }
  }

  private speakSingle(text: string, voice: SpeechSynthesisVoice | undefined, lang: string, onComplete: () => void) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    if (voice) utterance.voice = voice;
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateState('idle');
      onComplete();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      this.updateState('idle');
      onComplete();
    };
    
    window.speechSynthesis.speak(utterance);
  }

  private speakChunks(text: string, voice: SpeechSynthesisVoice | undefined, lang: string, onComplete: () => void) {
    const chunks = this.splitIntoChunks(text, 150);
    let index = 0;

    const speakNext = () => {
      if (!this.isSpeaking || index >= chunks.length) {
        this.isSpeaking = false;
        this.updateState('idle');
        onComplete();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = lang;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (voice) utterance.voice = voice;
      
      utterance.onend = () => {
        index++;
        speakNext();
      };
      utterance.onerror = () => {
        index++;
        speakNext();
      };
      
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }

  private splitIntoChunks(text: string, maxLength: number): string[] {
    const sentences = text.match(/[^।.!?]+[।.!?]*/g) ?? [text];
    const chunks: string[] = [];
    let current = '';
    
    for (const sentence of sentences) {
      if ((current + sentence).length > maxLength && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  stopSpeaking() {
    window.speechSynthesis.cancel();
    this.isSpeaking = false;
    if (this.state === 'speaking') {
      this.updateState('idle');
    }
  }

  setProcessing() {
    this.updateState('processing');
  }

  stopAll() {
    this.cancelListening();
    this.stopSpeaking();
  }

  cleanup() {
    this.stopAll();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  getState() {
    return this.state;
  }
}

export const voiceController = new VoiceController();

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^[\s]*[-•*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[→←↑↓➤►▶◆●■□▪]/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\.{2,}/g, '.')
    .replace(/\s{2,}/g, ' ')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .trim();
}

export function saveConversation(question: string, answer: string) {
  const messages = getConversationHistory();
  messages.push({ question, answer, timestamp: Date.now() });
  if (messages.length > 10) messages.shift();
  localStorage.setItem('voicebot_messages', JSON.stringify(messages));
}

export function getConversationHistory(): VoiceMessage[] {
  try {
    const stored = localStorage.getItem('voicebot_messages');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearConversationHistory() {
  localStorage.removeItem('voicebot_messages');
}
