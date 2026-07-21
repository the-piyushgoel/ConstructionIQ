import { AgentRegistry } from '../agentRegistry';
import { Agent, ReadonlyDecisionContext, AgentResponse } from '../agent.types';

class MockAgent implements Agent {
  readonly name = 'MockAgent';
  readonly version = '1.0';
  async execute(_context: ReadonlyDecisionContext, _requestId: string): Promise<AgentResponse> {
    return {} as AgentResponse;
  }
}

describe('AgentRegistry', () => {
  let registry: AgentRegistry;

  beforeEach(() => {
    registry = new AgentRegistry();
  });

  it('should register and retrieve an agent', () => {
    const agent = new MockAgent();
    registry.register(agent);

    const retrieved = registry.getAgent('MockAgent');
    expect(retrieved).toBe(agent);
  });

  it('should throw when getting unregistered agent', () => {
    expect(() => registry.getAgent('Missing')).toThrow('Agent Missing not found.');
  });

  it('should throw when registering duplicate agent', () => {
    const agent = new MockAgent();
    registry.register(agent);
    expect(() => registry.register(agent)).toThrow('Agent MockAgent is already registered.');
  });

  it('should unregister an agent', () => {
    const agent = new MockAgent();
    registry.register(agent);
    registry.unregister('MockAgent');
    expect(() => registry.getAgent('MockAgent')).toThrow();
  });

  it('should return all agents', () => {
    const agent = new MockAgent();
    registry.register(agent);
    expect(registry.getAllAgents()).toHaveLength(1);
  });
});
