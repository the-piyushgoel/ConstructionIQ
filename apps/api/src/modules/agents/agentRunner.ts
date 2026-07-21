import { AgentRegistry } from './agentRegistry';
import { ReadonlyDecisionContext, AgentResponse } from './agent.types';

export class AgentRunner {
  constructor(private readonly registry: AgentRegistry) {}

  getAgentCount(): number {
    return this.registry.getAllAgents().length;
  }

  async runAll(context: ReadonlyDecisionContext, requestId: string): Promise<AgentResponse[]> {
    const agents = this.registry.getAllAgents();
    
    // Execute all agents independently. Use allSettled so one failure doesn't crash the rest.
    const results = await Promise.allSettled(
      agents.map(agent => agent.execute(context, requestId))
    );

    const successfulResponses: AgentResponse[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        successfulResponses.push(result.value);
      } else {
        // Log the failure, but do not bubble up the crash to preserve other agents' work
        console.error(`[AgentRunner] Agent execution failed:`, result.reason);
      }
    }

    return successfulResponses;
  }
}
