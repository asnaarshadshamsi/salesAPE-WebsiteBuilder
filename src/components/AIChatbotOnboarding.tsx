"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";
import { 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  ArrowRight,
  Store,
  Utensils,
  Dumbbell,
  Heart,
  Briefcase,
  GraduationCap,
  Palette,
  Building2
} from "lucide-react";

// ==================== TYPES ====================

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface ExtractedBusinessData {
  name?: string;
  description?: string;
  businessType?: string;
  services?: string[];
  features?: string[];
  phone?: string;
  email?: string;
  address?: string;
  targetAudience?: string;
  uniqueSellingPoint?: string;
}

interface AIChatbotOnboardingProps {
  onComplete: (data: ExtractedBusinessData) => void;
  onCancel?: () => void;
}

// ==================== QUESTIONS ====================

const CONVERSATION_FLOW = [
  {
    question: "Hello! I'm your AI website assistant. What's the name of your business?",
    dataKey: "name",
    placeholder: "e.g., Bella's Boutique, FitLife Gym, Tasty Bites Cafe"
  },
  {
    question: "Thank you. What type of business is this? (e.g., restaurant, fitness gym, salon, ecommerce store, agency, etc.)",
    dataKey: "businessType",
    placeholder: "e.g., Online Fashion Store, Fitness Center, Italian Restaurant"
  },
  {
    question: "Excellent. What products or services do you offer? Please list a few key ones.",
    dataKey: "services",
    placeholder: "e.g., Personal Training, Group Classes, Nutrition Plans"
  },
  {
    question: "What makes your business unique? What's your competitive advantage or special offering?",
    dataKey: "uniqueSellingPoint",
    placeholder: "e.g., 24/7 access, Expert trainers, Customized plans"
  },
  {
    question: "Who is your target audience? Who are your ideal customers?",
    dataKey: "targetAudience",
    placeholder: "e.g., Young professionals, Fitness enthusiasts, Families",
    visual: "👥"
  },
  {
    question: "Almost done! Do you have contact information you'd like to include? (phone, email, address)",
    dataKey: "contactInfo",
    placeholder: "e.g., contact@business.com, +1 234 567 8900, 123 Main St",
    optional: true,
    visual: "📞"
  }
];

// Business type to icon mapping
const BUSINESS_TYPE_ICONS: Record<string, React.ReactElement> = {
  ecommerce: <Store className="w-6 h-6" />,
  store: <Store className="w-6 h-6" />,
  shop: <Store className="w-6 h-6" />,
  restaurant: <Utensils className="w-6 h-6" />,
  cafe: <Utensils className="w-6 h-6" />,
  food: <Utensils className="w-6 h-6" />,
  gym: <Dumbbell className="w-6 h-6" />,
  fitness: <Dumbbell className="w-6 h-6" />,
  workout: <Dumbbell className="w-6 h-6" />,
  salon: <Heart className="w-6 h-6" />,
  beauty: <Heart className="w-6 h-6" />,
  spa: <Heart className="w-6 h-6" />,
  agency: <Briefcase className="w-6 h-6" />,
  consulting: <Briefcase className="w-6 h-6" />,
  education: <GraduationCap className="w-6 h-6" />,
  school: <GraduationCap className="w-6 h-6" />,
  course: <GraduationCap className="w-6 h-6" />,
  design: <Palette className="w-6 h-6" />,
  creative: <Palette className="w-6 h-6" />,
  studio: <Palette className="w-6 h-6" />,
  default: <Building2 className="w-6 h-6" />
};

// Helper to get business icon
const getBusinessIcon = (businessType: string): React.ReactElement => {
  const lower = businessType.toLowerCase();
  for (const [key, icon] of Object.entries(BUSINESS_TYPE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return BUSINESS_TYPE_ICONS.default;
};

// ==================== COMPONENT ====================

export function AIChatbotOnboarding({ onComplete, onCancel }: AIChatbotOnboardingProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI website assistant. I'll ask you a few questions about your business, and then I'll generate a professional website for you. Ready to get started?",
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedBusinessData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Speech recognition
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setCurrentInput(transcript);
          setIsListening(false);
        };

        recognitionInstance.onerror = () => {
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const startConversation = () => {
    setConversationStarted(true);
    askNextQuestion(0);
  };

  const askNextQuestion = (index: number) => {
    if (index < CONVERSATION_FLOW.length) {
      const question = CONVERSATION_FLOW[index];
      const newMessage: Message = {
        id: `q-${index}-${Date.now()}`,
        role: "assistant",
        content: question.question,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, newMessage]);
      }, 500);
    } else {
      // All questions answered, generate website
      finalizeConversation();
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    const currentQuestion = CONVERSATION_FLOW[currentQuestionIndex];
    const userResponse = currentInput.trim();

    // Extract and store data based on current question
    const newData = { ...extractedData };
    
    switch (currentQuestion.dataKey) {
      case "name":
        newData.name = userResponse;
        break;
      case "businessType":
        newData.businessType = userResponse;
        break;
      case "services":
        newData.services = userResponse.split(',').map(s => s.trim());
        newData.description = userResponse;
        break;
      case "uniqueSellingPoint":
        newData.uniqueSellingPoint = userResponse;
        break;
      case "targetAudience":
        newData.targetAudience = userResponse;
        break;
      case "contactInfo":
        // Extract email, phone, address from response
        const emailMatch = userResponse.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const phoneMatch = userResponse.match(/(\+?[\d\s()-]{10,})/);
        if (emailMatch) newData.email = emailMatch[1];
        if (phoneMatch) newData.phone = phoneMatch[1];
        // Simple address detection - if it contains numbers and words
        if (/\d+.*[A-Za-z]+/.test(userResponse)) {
          newData.address = userResponse;
        }
        break;
    }

    setExtractedData(newData);
    setCurrentInput("");
    
    // AI acknowledgment
    const acknowledgments = [
      "Got it! Thanks for sharing that.",
      "Perfect! That helps a lot.",
      "Awesome! I'm getting a clear picture now.",
      "Excellent! That's really helpful.",
      "Great! I'm building your website profile."
    ];
    
    const ackMessage: Message = {
      id: `ack-${Date.now()}`,
      role: "assistant",
      content: acknowledgments[Math.floor(Math.random() * acknowledgments.length)],
      timestamp: new Date()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, ackMessage]);
      setIsProcessing(false);
      
      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      askNextQuestion(nextIndex);
    }, 800);
  };

  const finalizeConversation = () => {
    setIsGenerating(true);
    
    const finalMessage: Message = {
      id: "final",
      role: "assistant",
      content: "Perfect! I have everything I need. Let me generate your website now...",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, finalMessage]);

    // Simulate AI processing and then call onComplete
    setTimeout(() => {
      onComplete(extractedData);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative min-h-[700px] bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden shadow-xl">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col h-[700px]">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-base">AI Website Assistant</h3>
            <p className="text-xs text-gray-400">
              AI-Powered • Voice Enabled
            </p>
          </div>
          
          {/* Progress indicator */}
          {conversationStarted && (
            <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-md">
              <div className="flex gap-1">
                {Array.from({ length: CONVERSATION_FLOW.length }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i < currentQuestionIndex
                        ? 'bg-green-500'
                        : i === currentQuestionIndex
                        ? 'bg-blue-500'
                        : 'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {currentQuestionIndex}/{CONVERSATION_FLOW.length}
              </span>
            </div>
          )}
          
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-zinc-800">
              Cancel
            </Button>
          )}
        </div>

        {/* Messages Area with enhanced styling */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`group max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-gray-100 border border-zinc-700"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                <span className="text-xs opacity-60 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3 animate-in slide-in-from-bottom-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Show business icon preview when business type is extracted */}
          {extractedData.businessType && !isGenerating && (
            <div className="flex justify-center animate-in fade-in zoom-in duration-500">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  {getBusinessIcon(extractedData.businessType)}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Building website for</p>
                  <p className="font-semibold text-white">{extractedData.name || 'Your Business'}</p>
                  <p className="text-xs text-blue-400">{extractedData.businessType}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isGenerating && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900">
            {!conversationStarted ? (
              <div className="space-y-3">
                <Button
                  onClick={startConversation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Conversation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-xs text-gray-500">
                  Answer questions via typing or voice to build your website
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVoiceInput}
                    className={`shrink-0 transition-all ${
                      isListening 
                        ? "bg-red-600 hover:bg-red-700 border-red-600 text-white" 
                        : "hover:bg-zinc-800 hover:border-blue-500"
                    }`}
                    disabled={isProcessing}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isListening 
                        ? "Listening..." 
                        : CONVERSATION_FLOW[currentQuestionIndex]?.placeholder || "Type your answer or use voice..."
                    }
                    disabled={isProcessing || isListening}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isProcessing}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="icon"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {Object.keys(extractedData).length} details collected
                  </span>
                  <span className="text-gray-500">
                    Press Enter to send
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generating State */}
        {isGenerating && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900/80">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg px-6 py-4">
                <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                <div className="text-left">
                  <p className="font-semibold text-white">Generating your website...</p>
                  <p className="text-xs text-gray-400">Please wait while we create your website</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700">
                  <div className="h-full bg-blue-600 rounded-full" 
                       style={{ width: '100%', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                </div>
                <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Analyzing data
                  </span>
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                    Designing layout
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <div className="w-3 h-3 border-2 border-gray-600 rounded-full"></div>
                    Finalizing
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
