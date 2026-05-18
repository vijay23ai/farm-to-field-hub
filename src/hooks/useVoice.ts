import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceOptions {
  language?: string;
  continuous?: boolean;
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  mouthOpen: number;
}

const languageCodeMap: Record<string, string> = {
  en: "en-IN",
  te: "te-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  mr: "mr-IN",
};

export const useVoice = (options: UseVoiceOptions = {}) => {
  const { language = "en", continuous = false } = options;
  
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: "",
    error: null,
    isSupported: typeof window !== "undefined" && 
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    mouthOpen: 0,
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const mouthRafRef = useRef<number | null>(null);
  const mouthTargetRef = useRef(0);
  const mouthValRef = useRef(0);

  const startMouthLoop = useCallback(() => {
    if (mouthRafRef.current != null) return;
    const tick = () => {
      // ease toward target then decay so the mouth pulses per syllable
      mouthValRef.current += (mouthTargetRef.current - mouthValRef.current) * 0.35;
      mouthTargetRef.current *= 0.86;
      setState((prev) =>
        Math.abs(prev.mouthOpen - mouthValRef.current) < 0.02
          ? prev
          : { ...prev, mouthOpen: mouthValRef.current }
      );
      mouthRafRef.current = requestAnimationFrame(tick);
    };
    mouthRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopMouthLoop = useCallback(() => {
    if (mouthRafRef.current != null) {
      cancelAnimationFrame(mouthRafRef.current);
      mouthRafRef.current = null;
    }
    mouthTargetRef.current = 0;
    mouthValRef.current = 0;
    setState((prev) => (prev.mouthOpen === 0 ? prev : { ...prev, mouthOpen: 0 }));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: "Speech recognition not supported in this browser" }));
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    
    const recognition = recognitionRef.current;
    recognition.lang = languageCodeMap[language] || "en-IN";
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null, transcript: "" }));
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: finalTranscript || interimTranscript,
      }));
    };

    recognition.onerror = (event: any) => {
      let errorMessage = "Error occurred during speech recognition";
      if (event.error === "no-speech") {
        errorMessage = "No speech detected. Please try again.";
      } else if (event.error === "audio-capture") {
        errorMessage = "No microphone found. Please check your device.";
      } else if (event.error === "not-allowed") {
        errorMessage = "Microphone permission denied. Please allow access.";
      }
      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognition.start();
  }, [language, continuous, state.isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState(prev => ({ ...prev, isListening: false }));
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCodeMap[language] || "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to find a voice for the language
    const voices = synthRef.current.getVoices();
    const langCode = languageCodeMap[language] || "en-IN";
    const voice = voices.find(v => v.lang.startsWith(langCode.split("-")[0]));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true }));
      mouthTargetRef.current = 0.9;
      startMouthLoop();
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
      stopMouthLoop();
    };

    utterance.onerror = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
      stopMouthLoop();
    };

    utterance.onboundary = (ev: SpeechSynthesisEvent) => {
      // Pulse the mouth each word/syllable; vowel-heavy words open wider
      const word = text.slice(ev.charIndex, ev.charIndex + (ev.charLength || 4));
      const vowels = (word.match(/[aeiouAEIOU]/g) || []).length;
      mouthTargetRef.current = Math.min(1, 0.55 + vowels * 0.18 + Math.random() * 0.15);
    };

    synthRef.current.speak(utterance);
  }, [language, startMouthLoop, stopMouthLoop]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
      stopMouthLoop();
    }
  }, [stopMouthLoop]);

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: "" }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
  };
};
