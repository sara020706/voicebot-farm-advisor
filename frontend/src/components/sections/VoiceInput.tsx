import { useState, useRef, useEffect } from "react";
import { apiPredict, apiFertilizer, apiAIExtract, apiAIExplain, apiAIFollowup } from "../../lib/api";
import { getLang, addToHistory } from "../../lib/store";

interface VoiceInputProps {
  onNavigate: (section: string) => void;
  lang: string;
}

interface SoilValues {
  [key: string]: number | undefined;
  N?: number;
  P?: number;
  K?: number;
  pH?: number;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIResponse {
  extracted?: SoilValues;
  missing?: string[];
  followup?: string;
  lang?: string;
  complete?: boolean;
  explanation?: string;
  answer?: string;
}

function speak(text: string, lang: string) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-IN";
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

export default function VoiceInput({ onNavigate, lang: currentLang }: VoiceInputProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [soilValues, setSoilValues] = useState<SoilValues>({});
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Tap the mic to start");
  const [phase, setPhase] = useState<"collecting" | "predicting" | "explaining" | "followup">("collecting");
  const [prediction, setPrediction] = useState<{ crop: string; confidence: number } | null>(null);
  const [deficiencies, setDeficiencies] = useState<any[]>([]);
  const [detectedLang, setDetectedLang] = useState(currentLang);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = detectedLang === "hi" ? "hi-IN" : detectedLang === "ta" ? "ta-IN" : "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      await processUserInput(text);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setStatus(`Error: ${event.error}. Tap mic to try again.`);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const processUserInput = async (userText: string) => {
    setIsProcessing(true);
    addMessage("user", userText);

    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: userText }
    ];
    setConversationHistory(updatedHistory);

    try {
      if (phase === "followup" && prediction) {
        // Call backend AI followup endpoint
        const result = await apiAIFollowup({
          question: userText,
          crop: prediction.crop,
          confidence: prediction.confidence,
          soil_values: soilValues as Record<string, number>,
          deficiencies: deficiencies,
          conversation_history: updatedHistory,
          detected_lang: detectedLang
        });
        
        const answer = result.answer || "I could not process that question.";
        addMessage("assistant", answer);
        setConversationHistory([...updatedHistory, { role: "assistant", content: answer }]);
        speak(answer, detectedLang);
        setStatus("Tap mic to ask another question");
      } else {
        // Call backend AI extract endpoint
        const result = await apiAIExtract({
          user_message: userText,
          conversation_history: updatedHistory,
          current_values: soilValues,
          detected_lang: detectedLang
        });
        
        setDetectedLang(result.lang || detectedLang);

        const newValues = { ...soilValues };
        if (result.extracted) {
          Object.entries(result.extracted).forEach(([key, value]) => {
            if (value !== null && value !== undefined && (newValues as any)[key] === undefined) {
              (newValues as any)[key] = value;
            }
          });
        }
        setSoilValues(newValues);

        const collectedFields = Object.keys(newValues).filter(k => (newValues as any)[k] !== undefined);
        const allFields = ["N", "P", "K", "pH", "temperature", "humidity", "rainfall"];
        const stillMissing = allFields.filter(f => (newValues as any)[f] === undefined);

        if (stillMissing.length === 0) {
          const followupMsg = result.followup || "Great! I have all the information. Analyzing your soil now...";
          addMessage("assistant", followupMsg);
          setConversationHistory([...updatedHistory, { role: "assistant", content: followupMsg }]);
          await runPrediction(newValues, result.lang || detectedLang);
        } else {
          const followupText = result.followup || "Could you please provide more information?";
          addMessage("assistant", followupText);
          const newHistory = [...updatedHistory, { role: "assistant", content: followupText }];
          setConversationHistory(newHistory);

          setStatus(`Collected: ${collectedFields.join(", ")} · Need: ${stillMissing.join(", ")}`);

          setIsSpeaking(true);
          speak(followupText, result.lang || detectedLang);
          setTimeout(() => setIsSpeaking(false), 3000);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || "Sorry, I had trouble understanding that. Please try again.";
      addMessage("assistant", errorMsg);
      setStatus("Error — tap mic to retry");
      speak(errorMsg, detectedLang);
    } finally {
      setIsProcessing(false);
    }
  };

  const runPrediction = async (values: SoilValues, lang: string) => {
    setPhase("predicting");
    setStatus("Analyzing soil and finding best crop...");

    const predictingMsg = lang === "hi"
      ? "सभी जानकारी मिल गई। आपकी मिट्टी का विश्लेषण हो रहा है..."
      : lang === "ta"
      ? "அனைத்து தகவல்களும் கிடைத்தன. உங்கள் மண்ணை பகுப்பாய்வு செய்கிறேன்..."
      : "Got all the information. Analyzing your soil now...";

    speak(predictingMsg, lang);

    try {
      const predResult = await apiPredict({
        N: values.N!, P: values.P!, K: values.K!,
        pH: values.pH!, temperature: values.temperature!,
        humidity: values.humidity!, rainfall: values.rainfall!
      });

      const fertResult = await apiFertilizer({
        N: values.N!, P: values.P!, K: values.K!,
        crop: predResult.crop
      });

      setPrediction(predResult);
      setDeficiencies(fertResult.deficiencies ?? []);

      addToHistory({
        date: new Date().toISOString(),
        crop: predResult.crop,
        confidence: predResult.confidence,
        N: values.N!, P: values.P!, K: values.K!, ph: values.pH
      });
      localStorage.setItem("vb_last_crop", predResult.crop);

      setPhase("explaining");
      await generateExplanation(values, predResult, fertResult.deficiencies ?? [], lang);

    } catch (err: any) {
      const errorMsg = "Sorry, prediction failed. Please check if the server is running.";
      addMessage("assistant", errorMsg);
      setStatus("Prediction failed — check backend connection");
      speak(errorMsg, lang);
      setPhase("collecting");
    }
  };

  const generateExplanation = async (
    values: SoilValues,
    pred: { crop: string; confidence: number },
    defic: any[],
    lang: string
  ) => {
    setStatus("Generating explanation...");

    try {
      // Call backend AI explain endpoint
      const result = await apiAIExplain({
        crop: pred.crop,
        confidence: pred.confidence,
        soil_values: values as Record<string, number>,
        deficiencies: defic,
        detected_lang: lang
      });

      const explanation = result.explanation || `${pred.crop} is recommended for your soil with ${pred.confidence}% confidence.`;
      addMessage("assistant", explanation);
      setConversationHistory(prev => [...prev, {
        role: "assistant",
        content: explanation
      }]);

      setIsSpeaking(true);
      speak(explanation, lang);

      setTimeout(() => {
        setIsSpeaking(false);
        setPhase("followup");
        setStatus("Tap mic to ask a follow-up question");
      }, 8000);

    } catch {
      const fallback = lang === "hi"
        ? `आपकी मिट्टी के लिए ${pred.crop} सबसे अच्छा है। ${pred.confidence}% विश्वास के साथ।`
        : lang === "ta"
        ? `உங்கள் மண்ணுக்கு ${pred.crop} சிறந்தது. ${pred.confidence}% நம்பிக்கையுடன்.`
        : `${pred.crop} is recommended for your soil with ${pred.confidence}% confidence.`;

      addMessage("assistant", fallback);
      speak(fallback, lang);
      setPhase("followup");
      setStatus("Tap mic to ask a follow-up question");
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setSoilValues({});
    setConversationHistory([]);
    setPhase("collecting");
    setPrediction(null);
    setDeficiencies([]);
    setStatus("Tap the mic to start");
    window.speechSynthesis.cancel();
  };

  const getStatusColor = () => {
    if (isListening) return "#1d9e75";
    if (isProcessing || isSpeaking) return "#378add";
    if (phase === "followup") return "#ba7517";
    return "var(--color-text-secondary)";
  };

  const completedFields = Object.keys(soilValues).filter(k => (soilValues as any)[k] !== undefined);
  const totalFields = 7;
  const progress = (completedFields.length / totalFields) * 100;

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 0 2rem" }}>
      
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 4px" }}>
          Voice Assistant
        </h2>
        <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", margin: 0 }}>
          Speak naturally in Hindi, Tamil, or English — I will understand
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem" }}>
        {["en", "hi", "ta"].map(lang => (
          <button
            key={lang}
            onClick={() => setDetectedLang(lang)}
            style={{
              padding: "4px 12px",
              borderRadius: "20px",
              border: `1.5px solid ${detectedLang === lang ? "#1a4d2e" : "var(--color-border-tertiary)"}`,
              background: detectedLang === lang ? "#1a4d2e" : "transparent",
              color: detectedLang === lang ? "#fff" : "var(--color-text-secondary)",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: detectedLang === lang ? 500 : 400,
            }}
          >
            {lang === "en" ? "English" : lang === "hi" ? "हिन्दी" : "தமிழ்"}
          </button>
        ))}
      </div>

      {completedFields.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
              Soil data collected
            </span>
            <span style={{ fontSize: "11px", fontWeight: 500, color: "#1a4d2e" }}>
              {completedFields.length}/{totalFields}
            </span>
          </div>
          <div style={{ height: "4px", background: "var(--color-border-tertiary)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "#1a4d2e",
              borderRadius: "2px",
              transition: "width 0.4s ease"
            }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
            {Object.entries(soilValues).map(([key, val]) => val !== undefined && (
              <span key={key} style={{
                fontSize: "10px",
                padding: "2px 7px",
                borderRadius: "4px",
                background: "#eaf3de",
                color: "#27500a",
                fontWeight: 500
              }}>
                {key}: {val}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "16px",
        padding: "1rem",
        minHeight: "280px",
        maxHeight: "380px",
        overflowY: "auto",
        marginBottom: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto", color: "var(--color-text-tertiary)" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎙️</div>
            <p style={{ fontSize: "13px", margin: 0 }}>
              {detectedLang === "hi"
                ? "माइक दबाएं और अपनी मिट्टी के बारे में बताएं"
                : detectedLang === "ta"
                ? "மைக்கை அழுத்தி உங்கள் மண்ணைப் பற்றி சொல்லுங்கள்"
                : "Tap the mic and describe your soil or farm"}
            </p>
            <p style={{ fontSize: "11px", margin: "4px 0 0", color: "var(--color-text-tertiary)" }}>
              {detectedLang === "hi"
                ? "उदाहरण: 'मेरी मिट्टी में नाइट्रोजन कम है, pH 6.5 है'"
                : detectedLang === "ta"
                ? "உதாரணம்: 'என் மண்ணில் நைட்ரஜன் குறைவு, pH 6.5'"
                : "Example: 'My soil has low nitrogen and pH is around 6.5'"}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "80%",
              padding: "8px 12px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? "#1a4d2e" : "var(--color-background-secondary)",
              color: msg.role === "user" ? "#fff" : "var(--color-text-primary)",
              fontSize: "13px",
              lineHeight: "1.5",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div style={{ display: "flex", gap: "4px", padding: "8px 12px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "var(--color-text-tertiary)",
                animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {prediction && (
        <div style={{
          background: "#eaf3de",
          border: "1px solid #c0dd97",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <p style={{ fontSize: "11px", color: "#3b6d11", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Recommended crop
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1a4d2e", margin: 0, textTransform: "capitalize" }}>
              {prediction.crop}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "11px", color: "#3b6d11", margin: "0 0 2px" }}>Confidence</p>
            <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a4d2e", margin: 0 }}>
              {prediction.confidence}%
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <button
          onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
          disabled={isProcessing || isSpeaking}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: "none",
            background: isListening ? "#c0392b" : isProcessing || isSpeaking ? "#888" : "#1a4d2e",
            cursor: isProcessing || isSpeaking ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            boxShadow: isListening ? "0 0 0 8px rgba(192,57,43,0.2)" : "none",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            {isListening ? (
              <rect x="6" y="6" width="12" height="12" rx="2" fill="white"/>
            ) : (
              <>
                <rect x="9" y="2" width="6" height="12" rx="3" fill="white"/>
                <path d="M5 10a7 7 0 0014 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="21" x2="16" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>

        <p style={{ fontSize: "12px", color: getStatusColor(), margin: 0, textAlign: "center", fontWeight: isListening ? 500 : 400 }}>
          {isListening ? "Listening... tap to stop" : isProcessing ? "Processing..." : isSpeaking ? "Speaking..." : status}
        </p>

        <div style={{ display: "flex", gap: "8px" }}>
          {messages.length > 0 && (
            <button
              onClick={resetConversation}
              style={{
                padding: "6px 16px",
                borderRadius: "8px",
                border: "0.5px solid var(--color-border-tertiary)",
                background: "transparent",
                color: "var(--color-text-secondary)",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Start over
            </button>
          )}
          {prediction && (
            <button
              onClick={() => onNavigate("cropAdvisor")}
              style={{
                padding: "6px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#1a4d2e",
                color: "#fff",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              View full analysis →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
