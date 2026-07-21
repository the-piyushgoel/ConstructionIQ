import { ConsensusEngine } from './consensusEngine';
import { ConflictResolver } from './conflictResolver';
import { DecisionPackageBuilder } from './decisionPackageBuilder';
import { DecisionPackage } from './decision.types';
import { AgentResponse, ReadonlyDecisionContext } from '../agents/agent.types';

export class DecisionOrchestrator {
  private consensusEngine = new ConsensusEngine();
  private conflictResolver = new ConflictResolver();

  async orchestrate(
    prediction: Record<string, unknown>,
    attribution: Record<string, unknown>,
    _context: ReadonlyDecisionContext,
    agentResponses: AgentResponse[],
    totalAgentsRequested: number
  ): Promise<DecisionPackage> {
    
    // 1. Calculate Consensus
    const consensus = this.consensusEngine.calculateConsensus(agentResponses);

    // 2. Identify Conflicts
    const conflicts = this.conflictResolver.detectConflicts(agentResponses);

    // 3. Build Package
    const builder = new DecisionPackageBuilder();
    
    return builder
      .setPrediction(prediction)
      .setAttribution(attribution)
      .setAgentResponses(agentResponses)
      .setConsensus(consensus)
      .setConflicts(conflicts)
      .build(totalAgentsRequested);
  }
}
