import { Agent } from './agent.types';

export class AgentRegistry {
  private readonly agents = new Map<string, Agent>();

  register(agent: Agent): void {
    if (this.agents.has(agent.name)) {
      throw new Error(`Agent ${agent.name} is already registered.`);
    }
    this.agents.set(agent.name, agent);
  }

  unregister(name: string): void {
    this.agents.delete(name);
  }

  getAgent(name: string): Agent {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent ${name} not found.`);
    }
    return agent;
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}
