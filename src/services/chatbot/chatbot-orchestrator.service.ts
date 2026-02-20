/**
 * Chatbot Orchestrator Service
 * Main state machine orchestrating conversation flow with URL extraction and cross-questioning
 */

import { chatbotUrlService } from './chatbot-url.service';
import type { 
  ChatbotState, 
  ChatbotResponse, 
  ChatMessage, 
  ExtractedProfile, 
  WebsiteProfile, 
  ConfirmationPatch,
  ConversationState,
  ConfidenceLevel 
} from '@/types/chatbot';

class ChatbotOrchestratorService {
  /**
   * Main entry point: process user message with current state
   */
  async processMessage(
    userMessage: string, 
    currentState?: ChatbotState,
    messageHistory?: ChatMessage[]
  ): Promise<ChatbotResponse> {
    const state = currentState || this.initializeState();
    
    console.log('[Orchestrator] Processing message:', {
      message: userMessage.substring(0, 100),
      currentStateType: state.conversationState,
      currentQuestion: state.currentQuestion,
      profileName: state.profile?.name,
      profileBusinessType: state.profile?.businessType,
    });

    // Detect URL in message
    const detectedUrl = chatbotUrlService.detectUrl(userMessage);
    
    // Route based on current state
    switch (state.conversationState) {
      case 'awaiting_url_or_name':
        return this.handleAwaitingUrlOrName(userMessage, detectedUrl, state);
      
      case 'extracting_from_url':
        // This state is transitional, shouldn't receive messages
        return { success: false, error: 'Extraction in progress, please wait' };
      
      case 'confirming_extracted_profile':
        return this.handleConfirmingExtractedProfile(userMessage, state);
      
      case 'interviewing_user':
        return this.handleInterviewingUser(userMessage, detectedUrl, state);
      
      case 'enriching_with_url':
        return this.handleEnrichingWithUrl(userMessage, detectedUrl, state);
      
      case 'ready_to_generate_website':
        return this.handleReadyToGenerate(userMessage, state);
      
      default:
        return { success: false, error: 'Invalid conversation state' };
    }
  }

  /**
   * Initialize fresh conversation state
   */
  private initializeState(): ChatbotState {
    return {
      conversationState: 'awaiting_url_or_name',
      profile: {
        confidence: { overall: 'none' },
        dataSource: {},
      },
    };
  }

  /**
   * Handle awaiting_url_or_name state
   */
  private async handleAwaitingUrlOrName(
    userMessage: string,
    detectedUrl: string | null,
    state: ChatbotState
  ): Promise<ChatbotResponse> {
    if (detectedUrl) {
      // URL provided - extract from it
      return this.handleUrlProvided(detectedUrl, state);
    } else {
      // No URL - start interview mode
      const name = userMessage.trim();
      if (name.length > 0) {
        state.profile.name = name;
        if (!state.profile.confidence || typeof state.profile.confidence !== 'object') {
          state.profile.confidence = { overall: 'medium' };
        }
        state.profile.confidence.name = 'high';
        if (!state.profile.dataSource || typeof state.profile.dataSource !== 'object') {
          state.profile.dataSource = {};
        }
        state.profile.dataSource.name = 'user-provided';
        state.conversationState = 'interviewing_user';
        state.currentQuestion = 'businessType';

        // Return new state object
        const newState: ChatbotState = {
          ...state,
          conversationState: 'interviewing_user',
          currentQuestion: 'businessType',
          profile: {
            ...state.profile,
            name,
            confidence: state.profile.confidence ? { ...state.profile.confidence } : {},
            dataSource: state.profile.dataSource ? { ...state.profile.dataSource } : {},
          },
        };

        return {
          success: true,
          message: `Great! Let's build a website for **${name}**.\n\nWhat type of business is it? (e.g., restaurant, beauty salon, e-commerce store, agency, portfolio, etc.)`,
          state: newState,
          suggestedActions: ['restaurant', 'beauty salon', 'e-commerce', 'agency', 'portfolio'],
        };
      } else {
        return {
          success: true,
          message: "👋 Hi! I'll help you build your website.\n\nYou can either:\n1. Share your existing website URL (I'll extract the info)\n2. Tell me your business name (I'll guide you through)",
          state,
        };
      }
    }
  }

  /**
   * Handle URL provided - extract and move to confirmation
   */
  private async handleUrlProvided(
    url: string,
    state: ChatbotState
  ): Promise<ChatbotResponse> {
    console.log('[Orchestrator] URL detected:', url);

    // Normalize URL
    const normalizedUrl = chatbotUrlService.normalizeUrl(url);
    
    // Quick format validation
    if (!chatbotUrlService.isValidUrlFormat(normalizedUrl)) {
      return {
        success: false,
        error: "That doesn't look like a valid URL. Please provide a valid website URL (e.g., www.example.com)",
        state,
      };
    }

    // Update state
    const extractingState: ChatbotState = {
      ...state,
      urlDetected: normalizedUrl,
      conversationState: 'extracting_from_url',
    };

    // Extract (async)
    const extraction = await chatbotUrlService.extractFromUrl(normalizedUrl);
    
    if (!extraction.success || !extraction.profile) {
      const errorState: ChatbotState = {
        ...extractingState,
        urlValidated: false,
        extractionError: extraction.error,
        conversationState: 'interviewing_user',
      };
      
      return {
        success: false,
        error: `I couldn't extract info from that URL (${extraction.error}). Let's gather the details manually instead.\n\n**What's your business name?**`,
        state: errorState,
      };
    }

    // Extraction successful
    const pendingConfirmations = this.determinePendingConfirmations(extraction.profile);
    
    const successState: ChatbotState = {
      ...extractingState,
      extractedProfile: extraction.profile,
      urlValidated: true,
      conversationState: 'confirming_extracted_profile',
      pendingConfirmations,
      currentQuestion: pendingConfirmations[0],
    };

    // Generate summary
    const summary = chatbotUrlService.generateExtractionSummary(extraction.profile);

    return {
      success: true,
      message: `${summary}\n\n**Is "${extraction.profile.name}" the correct name?**`,
      state: successState,
      needsConfirmation: true,
      confirmationField: 'name',
      suggestedActions: ['Yes', 'No'],
    };
  }

  /**
   * Handle confirming extracted profile
   */
  private async handleConfirmingExtractedProfile(
    userMessage: string,
    state: ChatbotState
  ): Promise<ChatbotResponse> {
    console.log('[Orchestrator] handleConfirmingExtractedProfile called:', {
      userMessage,
      pendingConfirmations: state.pendingConfirmations,
      currentQuestion: state.currentQuestion,
    });

    if (!state.extractedProfile || !state.pendingConfirmations || state.pendingConfirmations.length === 0) {
      // All confirmations done - merge and generate
      state.conversationState = 'ready_to_generate_website';
      const mergedProfile = this.mergeProfiles(state.extractedProfile, state.profile, state.confirmationPatches);
      state.profile = mergedProfile;

      console.log('[Orchestrator] All confirmations done, moving to ready_to_generate_website');

      return {
        success: true,
        message: "Perfect! I have all the information I need. Let's generate your website! 🎉",
        state,
        suggestedActions: ['Generate Website'],
      };
    }

    const currentField = state.currentQuestion || state.pendingConfirmations[0];
    const response = userMessage.toLowerCase().trim();
    
    console.log('[Orchestrator] Current field:', currentField, 'User response:', response);
    
    // Check if user is confirming or rejecting
    if (response === 'yes' || response === 'y' || response === 'correct' || response === 'confirm') {
      console.log('[Orchestrator] User confirmed field:', currentField);
      
      // User confirmed - remove from pending
      const beforeFilter = [...state.pendingConfirmations];
      state.pendingConfirmations = state.pendingConfirmations.filter(f => f !== currentField);
      
      console.log('[Orchestrator] Filtered confirmations:', {
        before: beforeFilter,
        after: state.pendingConfirmations,
        removed: currentField,
        lengthBefore: beforeFilter.length,
        lengthAfter: state.pendingConfirmations.length,
      });
      
      // Mark as confirmed in profile
      if (state.extractedProfile) {
        const value = (state.extractedProfile as any)[currentField];
        (state.profile as any)[currentField] = value;
        
        // Ensure confidence is an object
        if (!state.profile.confidence || typeof state.profile.confidence !== 'object') {
          state.profile.confidence = { overall: 'medium' };
        }
        (state.profile.confidence as any)[currentField] = 'high';
        
        // Ensure dataSource is an object
        if (!state.profile.dataSource || typeof state.profile.dataSource !== 'object') {
          state.profile.dataSource = {};
        }
        (state.profile.dataSource as any)[currentField] = 'structured-data';
      }

      // Move to next confirmation
      if (state.pendingConfirmations.length > 0) {
        const nextField = state.pendingConfirmations[0];
        state.currentQuestion = nextField;
        
        console.log('[Orchestrator] Moving to next field:', nextField, 'remaining:', state.pendingConfirmations.length);
        
        // Return a NEW state object to ensure React detects the change
        const newState: ChatbotState = {
          ...state,
          pendingConfirmations: [...state.pendingConfirmations],
          profile: { 
            ...state.profile,
            confidence: state.profile.confidence ? { ...state.profile.confidence } : {},
            dataSource: state.profile.dataSource ? { ...state.profile.dataSource } : {},
          },
        };
        
        return this.askConfirmationQuestion(nextField, newState);
      } else {
        // All done
        console.log('[Orchestrator] All confirmations processed, ready to generate');
        
        state.conversationState = 'ready_to_generate_website';
        const mergedProfile = this.mergeProfiles(state.extractedProfile, state.profile, state.confirmationPatches);
        state.profile = mergedProfile;

        // Return NEW state object
        const finalState: ChatbotState = {
          ...state,
          pendingConfirmations: [],
          profile: { 
            ...state.profile,
            confidence: state.profile.confidence ? { ...state.profile.confidence } : {},
            dataSource: state.profile.dataSource ? { ...state.profile.dataSource } : {},
          },
        };

        return {
          success: true,
          message: "Perfect! I have all the information I need. Let's generate your website! 🎉",
          state: finalState,
          suggestedActions: ['Generate Website'],
        };
      }
    } else if (response === 'no' || response === 'n' || response === 'incorrect' || response === 'wrong') {
      // User rejected - ask for correction
      return {
        success: true,
        message: `Got it. What should the ${this.formatFieldName(currentField)} be?`,
        state,
        needsConfirmation: false,
      };
    } else {
      // User provided correction directly
      const correctedValue = userMessage.trim();
      
      // Save correction
      const patches = state.confirmationPatches || [];
      patches.push({
        field: currentField,
        oldValue: state.extractedProfile ? (state.extractedProfile as any)[currentField] : undefined,
        newValue: correctedValue,
        confirmed: true,
      });

      // Update profile with user correction
      const updatedProfile = { ...state.profile };
      (updatedProfile as any)[currentField] = correctedValue;
      
      if (!updatedProfile.confidence || typeof updatedProfile.confidence !== 'object') {
        updatedProfile.confidence = { overall: 'medium' };
      } else {
        updatedProfile.confidence = { ...updatedProfile.confidence };
      }
      (updatedProfile.confidence as any)[currentField] = 'high';
      
      if (!updatedProfile.dataSource || typeof updatedProfile.dataSource !== 'object') {
        updatedProfile.dataSource = {};
      } else {
        updatedProfile.dataSource = { ...updatedProfile.dataSource };
      }
      (updatedProfile.dataSource as any)[currentField] = 'user-provided';

      // Remove from pending
      const remainingConfirmations = state.pendingConfirmations.filter(f => f !== currentField);

      // Move to next
      if (remainingConfirmations.length > 0) {
        const nextField = remainingConfirmations[0];
        const newState: ChatbotState = {
          ...state,
          profile: updatedProfile,
          confirmationPatches: patches,
          pendingConfirmations: remainingConfirmations,
          currentQuestion: nextField,
        };
        return this.askConfirmationQuestion(nextField, newState);
      } else {
        const mergedProfile = this.mergeProfiles(state.extractedProfile, updatedProfile, patches);
        
        const finalState: ChatbotState = {
          ...state,
          profile: mergedProfile,
          confirmationPatches: patches,
          pendingConfirmations: [],
          conversationState: 'ready_to_generate_website',
        };

        return {
          success: true,
          message: "Perfect! I have all the information I need. Let's generate your website! 🎉",
          state: finalState,
          suggestedActions: ['Generate Website'],
        };
      }
    }
  }

  /**
   * Handle interviewing user (no URL provided initially)
   */
  private async handleInterviewingUser(
    userMessage: string,
    detectedUrl: string | null,
    state: ChatbotState
  ): Promise<ChatbotResponse> {
    const currentQuestion = state.currentQuestion;

    // Check if user provided URL during interview
    if (detectedUrl) {
      // Switch to URL enrichment mode
      state.conversationState = 'enriching_with_url';
      return this.handleUrlProvided(detectedUrl, state);
    }

    // Continue interview
    if (currentQuestion === 'businessType') {
      const businessType = userMessage.trim().toLowerCase();
      state.profile.businessType = businessType;
      if (!state.profile.confidence || typeof state.profile.confidence !== 'object') {
        state.profile.confidence = { overall: 'medium' };
      }
      state.profile.confidence.businessType = 'high';
      if (!state.profile.dataSource || typeof state.profile.dataSource !== 'object') {
        state.profile.dataSource = {};
      }
      state.profile.dataSource.businessType = 'user-provided';
      state.currentQuestion = 'description';

      console.log('[Orchestrator] Business type set, moving to description:', {
        businessType,
        nextQuestion: state.currentQuestion,
      });

      // Return new state object
      const newState: ChatbotState = {
        ...state,
        currentQuestion: 'description',
        profile: { 
          ...state.profile,
          businessType,
          confidence: state.profile.confidence ? { ...state.profile.confidence } : {},
          dataSource: state.profile.dataSource ? { ...state.profile.dataSource } : {},
        },
      };

      return {
        success: true,
        message: `Great! Tell me a bit about your ${businessType}. What makes it special?`,
        state: newState,
      };
    } else if (currentQuestion === 'description') {
      const description = userMessage.trim();
      state.profile.description = description;
      if (!state.profile.confidence || typeof state.profile.confidence !== 'object') {
        state.profile.confidence = { overall: 'medium' };
      }
      state.profile.confidence.description = 'high';
      if (!state.profile.dataSource || typeof state.profile.dataSource !== 'object') {
        state.profile.dataSource = {};
      }
      state.profile.dataSource.description = 'user-provided';
      state.currentQuestion = 'optionalUrl';

      console.log('[Orchestrator] Description set, moving to optional URL:', {
        descriptionLength: description.length,
        nextQuestion: state.currentQuestion,
      });

      // Return new state object
      const newState: ChatbotState = {
        ...state,
        currentQuestion: 'optionalUrl',
        profile: { 
          ...state.profile,
          description,
          confidence: state.profile.confidence ? { ...state.profile.confidence } : {},
          dataSource: state.profile.dataSource ? { ...state.profile.dataSource } : {},
        },
      };

      return {
        success: true,
        message: "Perfect! Do you have an existing website or social media page I can extract more info from? (optional - you can say 'skip' or 'no')",
        state: newState,
        suggestedActions: ['Skip'],
      };
    } else if (currentQuestion === 'optionalUrl') {
      const response = userMessage.toLowerCase().trim();
      
      if (response === 'skip' || response === 'no' || response === 'none') {
        // User doesn't want to provide URL
        const newState: ChatbotState = {
          ...state,
          conversationState: 'ready_to_generate_website',
        };
        
        return {
          success: true,
          message: "No problem! I have enough to get started. Let's generate your website! 🎉",
          state: newState,
          suggestedActions: ['Generate Website'],
        };
      } else if (detectedUrl) {
        // URL provided for enrichment
        state.conversationState = 'enriching_with_url';
        return this.handleUrlProvided(detectedUrl, state);
      } else {
        // Invalid response
        return {
          success: true,
          message: "Please provide a URL or type 'skip' to continue without one.",
          state,
          suggestedActions: ['Skip'],
        };
      }
    }

    console.log('[Orchestrator] Unknown interview question - falling back:', {
      currentQuestion,
      conversationState: state.conversationState,
    });

    return { success: false, error: 'Unknown interview question', state };
  }

  /**
   * Handle enriching with URL (URL provided late in interview)
   */
  private async handleEnrichingWithUrl(
    userMessage: string,
    detectedUrl: string | null,
    state: ChatbotState
  ): Promise<ChatbotResponse> {
    // This state is reached when URL is provided during/after interview
    // Treat it similar to handleUrlProvided but merge with existing profile
    
    const url = detectedUrl || state.urlDetected;
    if (!url) {
      return { success: false, error: 'No URL detected', state };
    }

    const normalizedUrl = chatbotUrlService.normalizeUrl(url);
    
    if (!chatbotUrlService.isValidUrlFormat(normalizedUrl)) {
      const newState: ChatbotState = {
        ...state,
        conversationState: 'interviewing_user',
      };
      return {
        success: false,
        error: "That doesn't look like a valid URL. Let's continue without it.",
        state: newState,
      };
    }

    const extraction = await chatbotUrlService.extractFromUrl(normalizedUrl);
    
    if (!extraction.success || !extraction.profile) {
      const newState: ChatbotState = {
        ...state,
        conversationState: 'interviewing_user',
      };
      return {
        success: false,
        error: `I couldn't extract info from that URL. Let's continue with what we have.`,
        state: newState,
      };
    }

    // Merge extracted with existing profile (user-provided takes priority)
    const mergedProfile = this.mergeProfiles(extraction.profile, state.profile);
    
    const newState: ChatbotState = {
      ...state,
      extractedProfile: extraction.profile,
      profile: mergedProfile,
      conversationState: 'ready_to_generate_website',
    };

    return {
      success: true,
      message: `Great! I've enriched your profile with info from ${normalizedUrl}. Let's generate your website! 🎉`,
      state: newState,
      suggestedActions: ['Generate Website'],
    };
  }

  /**
   * Handle ready to generate state
   */
  private handleReadyToGenerate(
    userMessage: string,
    state: ChatbotState
  ): Promise<ChatbotResponse> {
    // Just return confirmation
    return Promise.resolve({
      success: true,
      message: "Ready to generate! Please click the 'Generate Website' button to continue.",
      state,
      suggestedActions: ['Generate Website'],
    });
  }

  /**
   * Determine which fields need confirmation
   */
  private determinePendingConfirmations(extracted: ExtractedProfile): string[] {
    const confirmations: string[] = [];
    
    // Always confirm name and businessType
    if (extracted.name) confirmations.push('name');
    if (extracted.businessType) confirmations.push('businessType');
    
    return confirmations;
  }

  /**
   * Ask confirmation question for a specific field
   */
  private askConfirmationQuestion(field: string, state: ChatbotState): ChatbotResponse {
    if (!state.extractedProfile) {
      return { success: false, error: 'No extracted profile', state };
    }

    const value = (state.extractedProfile as any)[field];
    const question = `**Is "${value}" the correct ${this.formatFieldName(field)}?**`;

    return {
      success: true,
      message: question,
      state,
      needsConfirmation: true,
      confirmationField: field,
      suggestedActions: ['Yes', 'No'],
    };
  }

  /**
   * Merge extracted profile with user corrections
   */
  private mergeProfiles(
    extracted?: ExtractedProfile,
    userProvided?: Partial<WebsiteProfile>,
    patches?: ConfirmationPatch[]
  ): WebsiteProfile {
    const merged: WebsiteProfile = {
      confidence: { overall: 'medium' },
    };

    // Priority: user-provided > patches > extracted
    if (extracted) {
      Object.keys(extracted).forEach(key => {
        if (extracted[key as keyof ExtractedProfile] !== undefined) {
          (merged as any)[key] = extracted[key as keyof ExtractedProfile];
          if (!merged.confidence || typeof merged.confidence !== 'object') {
            merged.confidence = { overall: 'medium' };
          }
          (merged.confidence as any)[key] = extracted.confidence?.[key as keyof typeof extracted.confidence] || 'medium';
          if (!merged.dataSource || typeof merged.dataSource !== 'object') {
            merged.dataSource = {};
          }
          (merged.dataSource as any)[key] = 'structured-data';
        }
      });
    }

    if (userProvided) {
      Object.keys(userProvided).forEach(key => {
        if (userProvided[key as keyof typeof userProvided] !== undefined) {
          (merged as any)[key] = userProvided[key as keyof typeof userProvided];
          if (!merged.confidence || typeof merged.confidence !== 'object') {
            merged.confidence = { overall: 'medium' };
          }
          (merged.confidence as any)[key] = 'high';
          if (!merged.dataSource || typeof merged.dataSource !== 'object') {
            merged.dataSource = {};
          }
          (merged.dataSource as any)[key] = 'user-provided';
        }
      });
    }

    if (patches) {
      patches.forEach(patch => {
        if (patch.confirmed) {
          (merged as any)[patch.field] = patch.newValue;
          if (!merged.confidence || typeof merged.confidence !== 'object') {
            merged.confidence = { overall: 'medium' };
          }
          (merged.confidence as any)[patch.field] = 'high';
          if (!merged.dataSource || typeof merged.dataSource !== 'object') {
            merged.dataSource = {};
          }
          (merged.dataSource as any)[patch.field] = 'user-provided';
        }
      });
    }

    // Calculate overall confidence
    if (!merged.confidence || typeof merged.confidence !== 'object') {
      merged.confidence = { overall: 'medium' };
    }
    const confidenceLevels = Object.values(merged.confidence).filter(c => c !== 'none');
    if (confidenceLevels.length > 0) {
      const highCount = confidenceLevels.filter(c => c === 'high').length;
      const ratio = highCount / confidenceLevels.length;
      merged.confidence.overall = ratio > 0.7 ? 'high' : ratio > 0.4 ? 'medium' : 'low';
    }

    return merged;
  }

  /**
   * Format field name for display
   */
  private formatFieldName(field: string): string {
    const nameMap: Record<string, string> = {
      name: 'business name',
      businessType: 'business type',
      description: 'description',
      phone: 'phone number',
      email: 'email',
      address: 'address',
    };

    return nameMap[field] || field;
  }
}

export const chatbotOrchestrator = new ChatbotOrchestratorService();
