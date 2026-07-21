import { SignalAggregator } from './signalAggregator';
import { PredictionEngine } from './predictionEngine';
import { AttributionEngine } from './attributionEngine';
import { DecisionContextBuilder } from '../agents/decisionContext';
import { AgentRunner } from '../agents/agentRunner';
import { DecisionOrchestrator } from '../decision/decisionOrchestrator';
import { IntelligenceContext, PublicSignal } from './intelligence.types';
import { DecisionPackage } from '../decision/decision.types';

import { Project, RiskEvent, Prediction } from '@prisma/client';

export class IntelligencePipeline {
  constructor(
    private readonly signalAggregator: SignalAggregator,
    private readonly predictionEngine: PredictionEngine,
    private readonly attributionEngine: AttributionEngine,
    private readonly decisionContextBuilder: DecisionContextBuilder,
    private readonly agentRunner: AgentRunner,
    private readonly decisionOrchestrator: DecisionOrchestrator
  ) {}

  async run(
    _projectId: string,
    riskEventId: string,
    requestId: string,
    project: Project,
    riskEvents: RiskEvent[],
    historicalPredictions: Prediction[],
    publicSignals: PublicSignal[]
  ): Promise<DecisionPackage> {
    const { prediction, attribution, context } = await this.runPredictionOnly(
      riskEventId,
      requestId,
      project,
      riskEvents,
      historicalPredictions,
      publicSignals
    );

    return this.runDecisionOnly(
      _projectId,
      requestId,
      prediction,
      attribution,
      context
    );
  }

  async runPredictionOnly(
    riskEventId: string,
    requestId: string,
    project: Project,
    riskEvents: RiskEvent[],
    historicalPredictions: Prediction[],
    publicSignals: PublicSignal[]
  ) {
    const { context } = this.signalAggregator.aggregate(
      project,
      riskEvents,
      historicalPredictions,
      publicSignals
    );

    const prediction = await this.predictionEngine.executePrediction(riskEventId, context, requestId);
    const attribution = await this.attributionEngine.generateAttribution(prediction.id, context, requestId);

    return { 
      prediction: { ...prediction }, 
      attribution: { ...attribution }, 
      context 
    };
  }

  async runDecisionOnly(
    _projectId: string,
    requestId: string,
    prediction: Record<string, unknown>,
    attribution: Record<string, unknown>,
    intelligenceContext: IntelligenceContext
  ): Promise<DecisionPackage> {
    
    // Add risks individually since the context expects them
    intelligenceContext.identifiedRisks.forEach(risk => this.decisionContextBuilder.addRiskEvent(risk as unknown as Record<string, unknown>));
    intelligenceContext.publicSignals.forEach(signal => this.decisionContextBuilder.addPublicSignal(signal as unknown as Record<string, unknown>));

    const finalDecisionContext = this.decisionContextBuilder
      .setProject(intelligenceContext.projectDetails)
      .addPrediction(prediction)
      .addAttribution(attribution)
      .build();

    const agentResponses = await this.agentRunner.runAll(finalDecisionContext, requestId);
    
    return this.decisionOrchestrator.orchestrate(
      prediction,
      attribution,
      finalDecisionContext,
      agentResponses,
      this.agentRunner.getAgentCount()
    );
  }
}
