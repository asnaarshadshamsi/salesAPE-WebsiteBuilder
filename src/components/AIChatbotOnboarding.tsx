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
  Building2,
  Link as LinkIcon,
  XCircle
} from "lucide-react";
import { getAIChatbotResponse } from "@/actions/ai-chat";
import type { ChatbotState, ChatMessage } from "@/types/chatbot";

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
  // Rich URL-scraper data (populated when user provided a URL in the chatbot)
  sourceUrl?: string;
  logo?: string;
  heroImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  galleryImages?: string[];
  testimonials?: any[];
  products?: any[];
  socialLinks?: any;
  aboutContent?: string;
  _urlWasUsed?: boolean;
}

interface AIChatbotOnboardingProps {
  onComplete: (data: ExtractedBusinessData) => void;
  onCancel?: () => void;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatbotState, setChatbotState] = useState<ChatbotState | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmationButtons, setShowConfirmationButtons] = useState(false);
  const [extractingFromUrl, setExtractingFromUrl] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Speech recognition
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Prevent duplicate initialization in React Strict Mode
    if (initializedRef.current) return;
    initializedRef.current = true;

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
          // Briefly highlight the input so user knows to review then press Enter / Send
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
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

    // Start conversation automatically - only if no messages exist
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: "👋 Hi! I'll help you build your website.\n\nYou can either:\n1. Share your existing website URL (I'll extract the info)\n2. Tell me your business name (I'll guide you through)",
        timestamp: new Date()
      };
      setMessages([initialMessage]);
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

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsProcessing(true);

    try {
      // Check if it's a URL
      const urlPattern = /https?:\/\/|www\.|\.com|\.net|\.org|\.io/i;
      const looksLikeUrl = urlPattern.test(currentInput);
      
      if (looksLikeUrl) {
        setExtractingFromUrl(true);
      }

      console.log('[Component] Sending message with state:', {
        conversationState: chatbotState?.conversationState,
        currentQuestion: chatbotState?.currentQuestion,
        profileName: chatbotState?.profile?.name,
        message: currentInput.substring(0, 50),
      });

      // Call orchestrator
      const response = await getAIChatbotResponse(
        currentInput,
        chatbotState,
        messages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp }))
      );

      setExtractingFromUrl(false);

      console.log('[Component] Received response:', {
        success: response.success,
        conversationState: response.state?.conversationState,
        currentQuestion: response.state?.currentQuestion,
        message: response.message?.substring(0, 50),
      });

      if (response.success && response.message) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Update state
        if (response.state) {
          setChatbotState(response.state);
        }

        // Handle confirmation flow
        if (response.needsConfirmation) {
          setShowConfirmationButtons(true);
        } else {
          setShowConfirmationButtons(false);
        }

        // Check if ready to generate
        if (response.state?.conversationState === 'ready_to_generate_website') {
          setTimeout(() => {
            finalizeConversation(response.state);
          }, 1000);
        }
      } else if (response.error) {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `I encountered an issue: ${response.error}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('[Chatbot] Error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmationButton = async (confirmed: boolean) => {
    const confirmationInput = confirmed ? "Yes" : "No";
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: confirmationInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setShowConfirmationButtons(false);

    console.log('[Component] Confirmation button clicked:', {
      confirmed,
      currentState: chatbotState?.conversationState,
      pendingConfirmations: chatbotState?.pendingConfirmations,
      currentQuestion: chatbotState?.currentQuestion,
    });

    try {
      const response = await getAIChatbotResponse(
        confirmationInput,
        chatbotState,
        messages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp }))
      );

      console.log('[Component] Confirmation response received:', {
        success: response.success,
        conversationState: response.state?.conversationState,
        pendingConfirmations: response.state?.pendingConfirmations,
        currentQuestion: response.state?.currentQuestion,
        needsConfirmation: response.needsConfirmation,
      });

      if (response.success && response.message) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (response.state) {
          console.log('[Component] Updating chatbot state with:', {
            conversationState: response.state.conversationState,
            pendingConfirmations: response.state.pendingConfirmations,
          });
          setChatbotState(response.state);
        }

        if (response.needsConfirmation) {
          setShowConfirmationButtons(true);
        }

        if (response.state?.conversationState === 'ready_to_generate_website') {
          setTimeout(() => {
            finalizeConversation(response.state);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('[Chatbot] Confirmation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeConversation = (state?: ChatbotState) => {
    setIsGenerating(true);
    // The AI already said "Let's generate your website!" — skip the duplicate message.

    const resolvedState = state || chatbotState;
    const profile = resolvedState?.profile;
    // The extractedProfile holds the full production-scraper output when a URL was given.
    const scraped = resolvedState?.extractedProfile as any;
    const urlWasUsed = !!(resolvedState?.urlDetected || scraped?.sourceUrl);

    const extractedData: ExtractedBusinessData = {
      // Core profile (from chatbot answers or merged from scraper)
      name:         profile?.name,
      description:  profile?.description,
      businessType: profile?.businessType,
      services:     profile?.services,
      features:     profile?.features,
      phone:        profile?.phone,
      email:        profile?.email,
      address:      profile?.address,
      // Rich scraped fields — only present when URL was provided
      ...(urlWasUsed && scraped ? {
        _urlWasUsed:    true,
        sourceUrl:      resolvedState?.urlDetected || scraped?.sourceUrl,
        logo:           scraped?.logo,
        heroImage:      scraped?.heroImage,
        primaryColor:   scraped?.primaryColor,
        secondaryColor: scraped?.secondaryColor,
        galleryImages:  scraped?.galleryImages,
        testimonials:   scraped?.testimonials,
        products:       scraped?.products,
        socialLinks:    scraped?.socialLinks,
        aboutContent:   scraped?.aboutContent,
      } : {}),
    };

    setTimeout(() => {
      onComplete(extractedData);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!showConfirmationButtons) {
        handleSendMessage();
      }
    }
  };

  // Calculate progress
  const getProgress = () => {
    const state = chatbotState?.conversationState;
    if (!state || state === 'awaiting_url_or_name') return 0;
    if (state === 'extracting_from_url') return 20;
    if (state === 'confirming_extracted_profile') return 50;
    if (state === 'interviewing_user') return 60;
    if (state === 'enriching_with_url') return 80;
    if (state === 'ready_to_generate_website') return 100;
    return 0;
  };

  const progress = getProgress();

  return (
    <div className="relative h-full bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden shadow-xl">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-base">AI Website Assistant</h3>
            <p className="text-xs text-gray-400">
              {extractingFromUrl ? "Extracting from URL..." : "AI-Powered • Voice Enabled"}
            </p>
          </div>
          
          {/* Progress indicator */}
          {progress > 0 && (
            <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-md">
              <div className="w-24 bg-zinc-700 rounded-full h-2">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{progress}%</span>
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
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
                
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

          {/* URL Extraction indicator */}
          {extractingFromUrl && (
            <div className="flex gap-3 animate-in slide-in-from-bottom-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <div>
                  <p className="text-sm text-white font-medium">Extracting information from your URL...</p>
                  <p className="text-xs text-gray-400">This may take a moment</p>
                </div>
              </div>
            </div>
          )}

          {isProcessing && !extractingFromUrl && (
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

          {/* Show business preview when business info is available */}
          {chatbotState?.profile?.name && chatbotState?.profile?.businessType && !isGenerating && (
            <div className="flex justify-center animate-in fade-in zoom-in duration-500">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  {getBusinessIcon(chatbotState.profile.businessType)}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Building website for</p>
                  <p className="font-semibold text-white">{chatbotState.profile.name}</p>
                  <p className="text-xs text-blue-400">{chatbotState.profile.businessType}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Confirmation Buttons */}
        {!isGenerating && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900">
            {showConfirmationButtons ? (
              <div className="space-y-3">
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => handleConfirmationButton(true)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Yes
                  </Button>
                  <Button
                    onClick={() => handleConfirmationButton(false)}
                    disabled={isProcessing}
                    variant="outline"
                    className="hover:bg-red-600 hover:text-white hover:border-red-600 px-8"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    No
                  </Button>
                </div>
                <p className="text-center text-xs text-gray-500">
                  Or type a correction below
                </p>
              </div>
            ) : null}

            <div className={`space-y-3 ${showConfirmationButtons ? 'mt-3' : ''}`}>
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
                  disabled={isProcessing || extractingFromUrl}
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
                      : extractingFromUrl
                      ? "Extracting..."
                      : "Type your answer, business name, or URL..."
                  }
                  disabled={isProcessing || isListening || extractingFromUrl}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isProcessing || extractingFromUrl}
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
                  {chatbotState?.urlDetected && (
                    <>
                      <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                      URL detected
                    </>
                  )}
                  {chatbotState?.profile?.name && !chatbotState?.urlDetected && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      Profile in progress
                    </>
                  )}
                </span>
                <span className="text-gray-500">
                  Press Enter to send
                </span>
              </div>
            </div>
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
