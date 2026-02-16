"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  placeholder?: string;
}

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function VoiceInput({ onTranscript, className = "", placeholder }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimText += transcript;
          }
        }

        setInterimTranscript(interimText);

        if (finalTranscript) {
          onTranscript(finalTranscript);
          setInterimTranscript("");
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start recognition:", error);
      }
    }
  }, [recognition, isListening]);

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        className={`p-3 rounded-xl transition-all duration-200 ${
          isListening
            ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
            : "bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"
        }`}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </button>
      
      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Listening...
        </div>
      )}
      
      {/* Interim transcript preview */}
      {interimTranscript && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl max-w-xs truncate shadow-lg">
          {interimTranscript}
        </div>
      )}
    </div>
  );
}

// Voice-enabled Input component
interface VoiceEnabledInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  type?: string;
}

export function VoiceEnabledInput({
  value,
  onChange,
  placeholder,
  label,
  className = "",
  type = "text",
}: VoiceEnabledInputProps) {
  const handleVoiceTranscript = (transcript: string) => {
    onChange(value + (value ? " " : "") + transcript);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <VoiceInput onTranscript={handleVoiceTranscript} />
      </div>
    </div>
  );
}

// Voice-enabled Textarea component
interface VoiceEnabledTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  rows?: number;
}

export function VoiceEnabledTextarea({
  value,
  onChange,
  placeholder,
  label,
  className = "",
  rows = 4,
}: VoiceEnabledTextareaProps) {
  const handleVoiceTranscript = (transcript: string) => {
    onChange(value + (value ? " " : "") + transcript);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
        />
        <div className="absolute bottom-3 right-3">
          <VoiceInput onTranscript={handleVoiceTranscript} />
        </div>
      </div>
    </div>
  );
}
