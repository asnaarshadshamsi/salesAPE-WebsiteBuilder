"use server";

import { chatbotOrchestrator } from '@/services/chatbot/chatbot-orchestrator.service';
import type { ChatbotState, ChatbotResponse, ChatMessage as ChatbotMessage } from '@/types/chatbot';

const COHERE_API_KEY = process.env.COHERE_API_KEY || process.env.cohere_api_key || '';

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function getAIChatResponse(
  messages: ChatMessage[],
  context?: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    if (!COHERE_API_KEY) {
      console.error("[AI Chat] No Cohere API key found");
      return {
        success: false,
        error: "AI service not configured. Please set COHERE_API_KEY.",
      };
    }

    // Build conversation context
    const conversationHistory = messages
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    const systemPrompt = `You are a friendly AI assistant helping users create their business website. Your role is to:
1. Ask clarifying questions about their business
2. Extract key information naturally through conversation
3. Be conversational, encouraging, and helpful
4. Keep responses concise (2-3 sentences max)
5. Acknowledge their responses positively before asking next question

${context || ''}

Current conversation:
${conversationHistory}

Respond naturally as the assistant. If the user has provided enough information about a topic, acknowledge it and smoothly transition to the next important business aspect (services, target audience, unique features, contact info).`;

    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command",
        prompt: systemPrompt,
        max_tokens: 150,
        temperature: 0.8,
        k: 0,
        stop_sequences: ["User:", "\\n\\n"],
        return_likelihoods: "NONE",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[AI Chat] Cohere API error:", errorData);
      return {
        success: false,
        error: `AI service error: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const aiResponse = data.generations?.[0]?.text?.trim() || data.text?.trim();

    if (!aiResponse) {
      return {
        success: false,
        error: "AI returned empty response",
      };
    }

    // Clean up the response (remove "Assistant:" prefix if present)
    const cleanedResponse = aiResponse
      .replace(/^Assistant:\s*/i, "")
      .replace(/^AI:\s*/i, "")
      .trim();

    console.log("[AI Chat] Generated response:", cleanedResponse);

    return {
      success: true,
      response: cleanedResponse,
    };
  } catch (error) {
    console.error("[AI Chat] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function extractBusinessDataFromConversation(
  messages: ChatMessage[]
): Promise<{
  success: boolean;
  data?: {
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
  };
  error?: string;
}> {
  try {
    if (!COHERE_API_KEY) {
      return {
        success: false,
        error: "AI service not configured",
      };
    }

    // Build conversation for extraction
    const conversationText = messages
      .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
      .join("\n");

    const extractionPrompt = `Extract business information from this conversation and return it as a JSON object.

Conversation:
${conversationText}

Extract and return a JSON object with these fields (only include fields that were mentioned):
- name: business name
- description: what the business does (1-2 sentences)
- businessType: type of business (e.g., restaurant, fitness, ecommerce, salon, agency, etc.)
- services: array of services/products offered
- features: array of unique features or selling points
- phone: phone number if mentioned
- email: email address if mentioned
- address: physical address if mentioned
- targetAudience: who the target customers are
- uniqueSellingPoint: what makes this business special

Return ONLY the JSON object, no other text.`;

    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "command",
        prompt: extractionPrompt,
        max_tokens: 500,
        temperature: 0.3,
        return_likelihoods: "NONE",
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.statusText}`);
    }

    const data = await response.json();
    const extractedText = data.generations?.[0]?.text?.trim() || data.text?.trim();

    // Try to parse JSON from the response
    let jsonMatch = extractedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log("[AI Chat] Extracted business data:", parsedData);
      
      return {
        success: true,
        data: parsedData,
      };
    }

    // Fallback: manual extraction
    const fallbackData: any = {};
    
    // Simple pattern matching as fallback
    const userMessages = messages.filter(m => m.role === "user").map(m => m.content).join(" ");
    
    // Extract email
    const emailMatch = userMessages.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) fallbackData.email = emailMatch[1];
    
    // Extract phone
    const phoneMatch = userMessages.match(/(\+?[\d\s()-]{10,})/);
    if (phoneMatch) fallbackData.phone = phoneMatch[1];

    return {
      success: true,
      data: fallbackData,
    };
  } catch (error) {
    console.error("[AI Chat] Extraction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract data",
    };
  }
}

/**
 * New intelligent chatbot with URL extraction and cross-questioning
 */
export async function getAIChatbotResponse(
  userMessage: string,
  currentState?: ChatbotState,
  messageHistory?: ChatbotMessage[]
): Promise<ChatbotResponse> {
  try {
    console.log('[AI Chat Action] Processing message with orchestrator:', {
      userMessage: userMessage.substring(0, 50),
      hasState: !!currentState,
      conversationState: currentState?.conversationState,
      pendingConfirmations: currentState?.pendingConfirmations,
      currentQuestion: currentState?.currentQuestion,
    });
    
    const response = await chatbotOrchestrator.processMessage(
      userMessage,
      currentState,
      messageHistory
    );

    console.log('[AI Chat Action] Response from orchestrator:', {
      success: response.success,
      conversationState: response.state?.conversationState,
      pendingConfirmations: response.state?.pendingConfirmations,
      currentQuestion: response.state?.currentQuestion,
      messagePreview: response.message?.substring(0, 50),
    });

    return response;
  } catch (error) {
    console.error('[AI Chat Action] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process message',
      state: currentState,
    };
  }
}

/**
 * Helper to get chatbot state from extracted profile
 */
export async function getChatbotStateFromProfile(profile: any): Promise<ChatbotState> {
  return {
    conversationState: 'ready_to_generate_website',
    profile: {
      name: profile.name,
      description: profile.description,
      businessType: profile.businessType,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      services: profile.services,
      products: profile.products,
      features: profile.features,
      confidence: {
        overall: 'high',
        name: 'high',
        businessType: 'high',
        description: 'high',
      },
    },
  };
}
