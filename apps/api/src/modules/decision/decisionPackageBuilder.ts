import { DecisionPackage, ConsensusResult, Conflict, DecisionMetadata } from './decision.types';
import { AgentResponse } from '../agents/agent.types';
import { DecisionPriorityRules } from './decisionPriorityRules';
import { DecisionSummaryBuilder } from './decisionSummaryBuilder';

export class DecisionPackageBuilder {
  private prediction: Record<string, unknown> = {};
  private attribution: Record<string, unknown> = {};
  private agentResponses: AgentResponse[] = [];
  private consensus!: ConsensusResult;
  private conflicts: Conflict[] = [];
  
  private priorityRules = new DecisionPriorityRules();
  private summaryBuilder = new DecisionSummaryBuilder();

  setPrediction(prediction: Record<string, unknown>): this {
    this.prediction = prediction;
    return this;
  }

  setAttribution(attribution: Record<string, unknown>): this {
    this.attribution = attribution;
    return this;
  }

  setAgentResponses(responses: AgentResponse[]): this {
    this.agentResponses = responses;
    return this;
  }

  setConsensus(consensus: ConsensusResult): this {
    this.consensus = consensus;
    return this;
  }

  setConflicts(conflicts: Conflict[]): this {
    this.conflicts = conflicts;
    return this;
  }

  build(totalAgentsRequested: number): DecisionPackage {
    const baseSeverity = this.prediction?.score && typeof this.prediction.score === 'number'
      ? (this.prediction.score > 84 ? 'CRITICAL' : this.prediction.score > 59 ? 'HIGH' : this.prediction.score > 29 ? 'MEDIUM' : 'LOW')
      : 'LOW';

    const priority = this.priorityRules.calculatePriority(baseSeverity, this.consensus.overallScore);
    const summary = this.summaryBuilder.buildSummary(this.prediction, this.consensus);

    const successfulAgents = this.agentResponses.length;
    const failedAgents = totalAgentsRequested - successfulAgents;

    const metadata: DecisionMetadata = {
      generatedAt: new Date().toISOString(),
      decisionVersion: '1.0.0',
      pipelineVersion: 'Phase2C.3A',
      agentCount: totalAgentsRequested,
      successfulAgents,
      failedAgents
    };

    return {
      prediction: this.prediction,
      attribution: this.attribution,
      agentResponses: this.agentResponses,
      consensus: this.consensus,
      conflicts: this.conflicts,
      priority,
      summary,
      metadata
    };
  }
}
