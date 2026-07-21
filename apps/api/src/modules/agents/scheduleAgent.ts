import { BaseAgent } from './baseAgent';
import { AgentResponse, ReadonlyDecisionContext } from './agent.types';
import { SchedulePrompt } from '../../services/ai/prompts/schedulePrompt';
import { z } from 'zod';

export class ScheduleAgent extends BaseAgent {
  readonly name = 'ScheduleAgent';
  readonly version = '1.0.0';

  protected buildPromptMessages(context: ReadonlyDecisionContext): Array<{ role: string; content: string }> {
    const prompt = new SchedulePrompt();
    return prompt.buildMessages({
      currentSchedule: (context.project?.schedule as unknown[]) || [],
      delays: (context.project?.delays as unknown[]) || []
    }) as Array<{ role: string; content: string }>;
  }

  protected getResponseSchema(): z.ZodSchema<unknown> {
    return z.object({
      adjustedTimeline: z.array(z.object({
        taskId: z.string(),
        newStartDate: z.string(),
        newEndDate: z.string(),
        reason: z.string()
      }))
    });
  }

  protected mapResponse(rawResponse: unknown): Omit<AgentResponse, 'metadata' | 'agentName'> {
    const response = rawResponse as { adjustedTimeline: { taskId: string, newStartDate: string, newEndDate: string, reason: string }[] };
    return {
      findings: response.adjustedTimeline,
      recommendations: response.adjustedTimeline.map(a => ({
        action: `Adjust task ${a.taskId} to start ${a.newStartDate}`,
        impact: a.reason
      })),
      confidence: {
        score: 85,
        reasoning: 'Critical path and delays calculated.'
      }
    };
  }
}
