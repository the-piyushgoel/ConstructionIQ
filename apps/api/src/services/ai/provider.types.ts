export interface AIRequest {
  system?: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
}
