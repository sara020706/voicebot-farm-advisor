import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Loader2, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { checkSpeechSupport } from '@/lib/speechUtils';
import { apiFarmAssistant } from '@/lib/api';
import { voiceController, cleanTextForSpeech, saveConversation, getConversationHistory } from '@/lib/voiceController';

const LANGUAGE_CODES = {
  english: 'en-IN',
  tamil: 'ta-IN',
  hindi: 'hi-IN',
  telugu: 'te-IN',
};

const LANGUAGE_LABELS = {
  english: 'English',
  tamil: 'தமிழ்',
  hindi: 'हिंदी',
  telugu: 'తెలుగు',
};

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function FarmVoiceAssistant() {
  const [state, setState] = useState<VoiceState>('idle');
  const [userQuestion, setUserQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof LANGUAGE_CODES>('hindi');
  const [browserSupport, setBrowserSupport] = useState({ recognition: true, synthesis: true });
  const lastClickRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const support = checkSpeechSupport();
    setBrowserSupport(support);
    
    if (!support.recognition) {
      setError('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    const history = getConversationHistory();
    if (history.length > 0) {
      const last = history[history.length - 1];
      setUserQuestion(last.question);
      setAiResponse(last.answer);
    }

    voiceController.initialize(setState);

    return () => {
      voiceController.cleanup();
    };
  }, []);

  const handleStartListening = () => {
    const now = Date.now();
    if (now - lastClickRef.current < 500) return;
    lastClickRef.current = now;

    if (state === 'speaking') {
      voiceController.stopSpeaking();
    }

    setError('');
    setUserQuestion('');
    setAiResponse('');

    voiceController.startListening(
      LANGUAGE_CODES[selectedLanguage],
      (transcript) => {
        setUserQuestion(transcript);
        voiceController.setProcessing();
        getAIResponse(transcript);
      },
      (errorMsg) => setError(errorMsg)
    );
  };

  const handleCancelListening = () => {
    voiceController.cancelListening();
    setError('');
  };

  const getAIResponse = async (question: string) => {
    abortControllerRef.current = new AbortController();
    
    try {
      const data = await apiFarmAssistant(question);
      
      if (abortControllerRef.current.signal.aborted) return;
      
      setAiResponse(data.answer);
      saveConversation(question, data.answer);
      
      const cleanedText = cleanTextForSpeech(data.answer);
      voiceController.startSpeaking(
        cleanedText,
        LANGUAGE_CODES[selectedLanguage],
        () => {}
      );
    } catch (err: any) {
      if (abortControllerRef.current.signal.aborted) return;
      setError(err.message || 'Network error');
      setState('idle');
    }
  };

  const handleStopSpeaking = () => {
    voiceController.stopSpeaking();
  };

  const handleReplay = () => {
    if (aiResponse && state === 'idle') {
      const cleanedText = cleanTextForSpeech(aiResponse);
      voiceController.startSpeaking(
        cleanedText,
        LANGUAGE_CODES[selectedLanguage],
        () => {}
      );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🌾 Farm Voice Assistant</CardTitle>
          <CardDescription>Ask farming questions in your language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!browserSupport.recognition && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>Voice input requires Chrome or Edge browser</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 flex-wrap">
            {(Object.keys(LANGUAGE_CODES) as Array<keyof typeof LANGUAGE_CODES>).map((lang) => (
              <Button
                key={lang}
                variant={selectedLanguage === lang ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLanguage(lang)}
                disabled={state !== 'idle'}
              >
                {LANGUAGE_LABELS[lang]}
              </Button>
            ))}
          </div>

          {state !== 'idle' && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {state === 'listening' && <><Mic className="h-4 w-4 animate-pulse" />Listening...</>}
                {state === 'processing' && <><Loader2 className="h-4 w-4 animate-spin" />Processing...</>}
                {state === 'speaking' && <><Volume2 className="h-4 w-4 animate-pulse" />Speaking...</>}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={handleStartListening}
              disabled={state !== 'idle'}
              className="h-24 w-24 rounded-full"
              variant="default"
            >
              <Mic className="h-12 w-12" />
            </Button>
            {state === 'listening' && (
              <Button
                size="lg"
                onClick={handleCancelListening}
                className="h-24 w-24 rounded-full"
                variant="destructive"
              >
                <X className="h-12 w-12" />
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {userQuestion && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Your Question:</h3>
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-base">{userQuestion}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {aiResponse && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground">AI Answer:</h3>
                <div className="flex gap-2">
                  {state === 'speaking' && (
                    <Button size="sm" variant="destructive" onClick={handleStopSpeaking} className="gap-2">
                      <X className="h-4 w-4" />Stop
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReplay}
                    className="gap-2"
                    disabled={state !== 'idle'}
                  >
                    <Volume2 className="h-4 w-4" />Replay
                  </Button>
                </div>
              </div>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {!userQuestion && state === 'idle' && (
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Tap the microphone to ask:</p>
              <ul className="text-xs space-y-1">
                <li>• Crop selection advice</li>
                <li>• Pest control solutions</li>
                <li>• Fertilizer recommendations</li>
                <li>• Irrigation tips</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
