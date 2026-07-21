import { AgentRunner } from '../agentRunner';
import { AgentRegistry } from '../agentRegistry';
import { Agent, ReadonlyDecisionContext, AgentResponse } from '../agent.types';

class SuccessAgent implements Agent {
  readonly name = 'SuccessAgent';
  readonly version = '1.0';
  async execute(): Promise<AgentResponse> {
    return { agentName: 'SuccessAgent', findings: 'Success' } as AgentResponse;
  }
}

class FailingAgent implements Agent {
  readonly name = 'FailingAgent';
  readonly version = '1.0';
  async execute(): Promise<AgentResponse> {
    throw new Error('Agent failed explicitly');
  }
}

describe('AgentRunner', () => {
  let registry: AgentRegistry;
  let runner: AgentRunner;

  beforeEach(() => {
    registry = new AgentRegistry();
    runner = new AgentRunner(registry);
  });

  it('should execute multiple agents and return successful responses', async () => {
    registry.register(new SuccessAgent());
    
    class SuccessAgent2 implements Agent { 
      readonly name = 'SuccessAgent2'; 
      readonly version = '1.0';
      async execute(): Promise<AgentResponse> {
        return { agentName: 'SuccessAgent2', findings: 'Success2' } as AgentResponse;
      }
    }
    registry.register(new SuccessAgent2());

    const results = await runner.runAll({} as ReadonlyDecisionContext, 'req-1');
    expect(results).toHaveLength(2);
    expect(results[0].agentName).toBe('SuccessAgent');
    expect(results[1].agentName).toBe('SuccessAgent2');
  });

  it('should continue executing and return successful responses if one agent fails', async () => {
    registry.register(new SuccessAgent());
    registry.register(new FailingAgent());

    const results = await runner.runAll({} as ReadonlyDecisionContext, 'req-2');
    
    expect(results).toHaveLength(1);
    expect(results[0].agentName).toBe('SuccessAgent');
  });
});
