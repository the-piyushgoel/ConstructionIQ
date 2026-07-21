import { SignalAggregator } from '../signalAggregator';
import { Project, RiskEvent, Prediction } from '@prisma/client';
import { PublicSignal } from '../intelligence.types';

describe('SignalAggregator', () => {
  it('should correctly aggregate context and calculate completeness', () => {
    const aggregator = new SignalAggregator();

    const project = {
      id: 'proj-1',
      name: 'Test Project',
      status: 'ACTIVE',
      budget: 1000,
      actualCost: 500,
      startDate: new Date(),
      endDate: new Date(),
    } as unknown as Project;

    const riskEvents = [{ id: 'risk-1', predictedScore: 80 }] as unknown as RiskEvent[];
    const predictions = [{ id: 'pred-1', score: 75 }] as unknown as Prediction[];
    const publicSignals = [{ source: 'weather', type: 'storm', value: 'high', confidence: 0.9, timestamp: new Date().toISOString() }] as PublicSignal[];

    const result = aggregator.aggregate(project, riskEvents, predictions, publicSignals);

    expect(result.metadata.completeness).toBe(100);
    expect(result.metadata.missingFields).toHaveLength(0);
    expect(result.metadata.signalCount).toBe(3);
    
    expect(result.context.projectDetails.name).toBe('Test Project');
    expect(result.context.publicSignals).toHaveLength(1);
  });

  it('should identify missing fields', () => {
    const aggregator = new SignalAggregator();

    const project = {
      id: 'proj-2',
      name: 'Valid Name',
      startDate: new Date(),
      budget: null,
    } as unknown as Project;

    const result = aggregator.aggregate(project, [], [], []);

    expect(result.metadata.completeness).toBe(50); // budget and endDate are missing. So 2/4 = 50%
    expect(result.metadata.missingFields).toContain('budget');
    expect(result.metadata.missingFields).toContain('endDate');
  });
});
