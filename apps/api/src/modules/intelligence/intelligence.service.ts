import { IntelligencePipeline } from './intelligencePipeline';
import { SimulationService } from '../simulation/simulation.service';
import { ProjectRepository } from '../projects/project.repository';
import { RiskEventRepository } from '../risk-events/risk-event.repository';
import { PredictionRepository } from '../predictions/prediction.repository';
import { AppError } from '../../types';
import { IntelligenceContext, PublicSignal } from './intelligence.types';

export class IntelligenceService {
  constructor(
    private readonly pipeline: IntelligencePipeline,
    private readonly simulationService: SimulationService,
    private readonly projectRepo: ProjectRepository,
    private readonly riskEventRepo: RiskEventRepository,
    private readonly predictionRepo: PredictionRepository
  ) {}

  private async fetchContextData(projectId: string) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');

    const { data: riskEvents } = await this.riskEventRepo.findAll({
      where: { projectId },
      take: 50,
    });

    const { data: historicalPredictions } = await this.predictionRepo.findAll({
      where: { riskEvent: { projectId } },
      take: 50,
    });

    // In a real system, public signals would be fetched from external integrations
    // For now we pass an empty array or mocked signals.
    const publicSignals: PublicSignal[] = [];

    return { project, riskEvents, historicalPredictions, publicSignals };
  }

  async runFull(projectId: string, riskEventId: string, requestId: string) {
    const { project, riskEvents, historicalPredictions, publicSignals } = await this.fetchContextData(projectId);

    // Validate risk event exists
    const riskEvent = await this.riskEventRepo.findById(riskEventId);
    if (!riskEvent || riskEvent.projectId !== projectId) {
      throw new AppError(404, 'NOT_FOUND', 'Risk Event not found or does not belong to the project');
    }

    const decisionPackage = await this.pipeline.run(
      projectId,
      riskEventId,
      requestId,
      project,
      riskEvents,
      historicalPredictions,
      publicSignals
    );

    return this.simulationService.runSimulation(decisionPackage);
  }

  async runPredictionOnly(projectId: string, riskEventId: string, requestId: string) {
    const { project, riskEvents, historicalPredictions, publicSignals } = await this.fetchContextData(projectId);

    const riskEvent = await this.riskEventRepo.findById(riskEventId);
    if (!riskEvent || riskEvent.projectId !== projectId) {
      throw new AppError(404, 'NOT_FOUND', 'Risk Event not found or does not belong to the project');
    }

    return this.pipeline.runPredictionOnly(
      riskEventId,
      requestId,
      project,
      riskEvents,
      historicalPredictions,
      publicSignals
    );
  }

  async runDecisionOnly(
    projectId: string,
    requestId: string,
    prediction: Record<string, unknown>,
    attribution: Record<string, unknown>,
    context: IntelligenceContext
  ) {
    // The user requirement explicitly states:
    // The decision endpoint must stop after the Decision Orchestrator.
    // Do NOT invoke the Simulation Engine from runDecisionOnly().
    return this.pipeline.runDecisionOnly(
      projectId,
      requestId,
      prediction,
      attribution,
      context
    );
  }
}
