import { SimulationEngine } from './simulationEngine';
import { RecoveryPlanGenerator } from './recoveryPlanGenerator';
import { RecoveryPlanSelector } from './recoveryPlanSelector';
import { RecoveryPackageBuilder } from './recoveryPackageBuilder';
import { DecisionPackage } from '../decision/decision.types';
import { RecoveryPackage } from './simulation.types';
import { Logger } from '../../utils/logger';
import { Metrics } from '../../utils/metrics';

export class SimulationService {
  private readonly recoveryPackageBuilder: RecoveryPackageBuilder;

  constructor(
    private readonly simulationEngine: SimulationEngine,
    private readonly recoveryPlanGenerator: RecoveryPlanGenerator,
    recoveryPlanSelector: RecoveryPlanSelector
  ) {
    this.recoveryPackageBuilder = new RecoveryPackageBuilder(recoveryPlanSelector);
  }

  runSimulation(decisionPackage: DecisionPackage): RecoveryPackage {
    const startTime = Date.now();
    Logger.info('Starting SimulationService.runSimulation', { decisionVersion: decisionPackage.metadata.decisionVersion });

    // 1. Run Simulations
    const simulationResults = this.simulationEngine.run(decisionPackage);

    // 2. Generate Plans based on Simulation Scenarios
    const recoveryPlans = this.recoveryPlanGenerator.generate(decisionPackage, simulationResults);

    // 3. Build the final RecoveryPackage (includes Plan Selection)
    const recoveryPackage = this.recoveryPackageBuilder.build(
      decisionPackage,
      simulationResults,
      recoveryPlans
    );

    const latency = Date.now() - startTime;
    Metrics.recordLatency('simulation_service_execution', latency);
    Metrics.incrementCounter('simulation_service_success');
    
    Logger.info('SimulationService.runSimulation completed successfully', {
      recommendedPlanId: recoveryPackage.recommendedRecoveryPlan?.id,
      simulationCount: simulationResults.length,
      latency
    });

    return recoveryPackage;
  }
}
