/**
 * Utility functions for Web Speech API compatibility and helpers
 */

export interface SpeechSupport {
  recognition: boolean;
  synthesis: boolean;
}

/**
 * Check if browser supports Web Speech APIs
 */
export function checkSpeechSupport(): SpeechSupport {
  const recognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const synthesis = 'speechSynthesis' in window;
  
  return { recognition, synthesis };
}

/**
 * Get available voices for a specific language
 */
export function getVoicesForLanguage(lang: string): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith(lang.split('-')[0]));
}

/**
 * Stop any ongoing speech synthesis
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if microphone permission is granted
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    return false;
  }
}
