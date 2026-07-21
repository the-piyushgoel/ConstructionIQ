import { IntelligenceContext, ContextMetadata, PublicSignal } from './intelligence.types';
import { Project, RiskEvent, Prediction } from '@prisma/client';

export class SignalAggregator {
  aggregate(
    project: Project,
    riskEvents: RiskEvent[],
    historicalPredictions: Prediction[],
    publicSignals: PublicSignal[]
  ): { context: IntelligenceContext; metadata: ContextMetadata } {
    const requiredFields: (keyof Project)[] = ['budget', 'startDate', 'endDate', 'name'];
    const missingFields = requiredFields.filter((field) => !project[field]);
    const completeness = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);

    const context: IntelligenceContext = {
      projectDetails: {
        id: project.id,
        name: project.name,
        status: project.status,
        budget: project.budget,
        actualCost: project.actualCost,
      },
      identifiedRisks: riskEvents.map(r => ({
        id: r.id,
        predictedScore: r.predictedScore,
      })),
      historicalPredictions: historicalPredictions.map(p => ({
        id: p.id,
        score: p.score,
      })),
      publicSignals,
    };

    const metadata: ContextMetadata = {
      completeness,
      missingFields,
      signalCount: publicSignals.length + riskEvents.length + historicalPredictions.length,
      timestamp: new Date().toISOString(),
    };

    return { context, metadata };
  }
}
