import { BasePrompt } from './basePrompt';

export interface ScheduleContext {
  currentSchedule: unknown[];
  delays: unknown[];
}

export const ScheduleSchema = {
  adjustedTimeline: [
    { taskId: 'string', newStartDate: 'string', newEndDate: 'string', reason: 'string' }
  ]
};

export class SchedulePrompt extends BasePrompt<ScheduleContext, typeof ScheduleSchema> {
  protected getSystemPrompt(): string {
    return 'You are an AI assistant specialized in construction scheduling and timeline optimization.';
  }

  protected getInstructions(): string {
    return 'Evaluate the schedule and any delays to propose an adjusted, optimized timeline.';
  }

  protected getExpectedSchema() {
    return ScheduleSchema;
  }
}
