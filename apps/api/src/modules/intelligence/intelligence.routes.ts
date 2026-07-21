import { Router } from 'express';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
import { IntelligencePipeline } from './intelligencePipeline';
import { SignalAggregator } from './signalAggregator';
import { PredictionEngine } from './predictionEngine';
import { AttributionEngine } from './attributionEngine';
import { DecisionContextBuilder } from '../agents/decisionContext';
import { AgentRunner } from '../agents/agentRunner';
import { AgentRegistry } from '../agents/agentRegistry';
import { DecisionOrchestrator } from '../decision/decisionOrchestrator';
import { ConsensusEngine } from '../decision/consensusEngine';
import { ConflictResolver } from '../decision/conflictResolver';
import { SimulationService } from '../simulation/simulation.service';
import { SimulationEngine } from '../simulation/simulationEngine';
import { ScenarioGenerator } from '../simulation/scenarioGenerator';
import { ImpactAnalyzer } from '../simulation/impactAnalyzer';
import { RecoveryPlanGenerator } from '../simulation/recoveryPlanGenerator';
import { RecoveryPlanSelector } from '../simulation/recoveryPlanSelector';
import { ProjectRepository } from '../projects/project.repository';
import { RiskEventRepository } from '../risk-events/risk-event.repository';
import { PredictionRepository } from '../predictions/prediction.repository';
import { authenticateJWT, requireRole } from '../auth/auth.middleware';
import { validate } from '../../middleware/validate';
import { runFullSchema, runPredictionSchema, runDecisionSchema } from './intelligence.validator';

// 1. Repositories
const projectRepo = new ProjectRepository();
const riskEventRepo = new RiskEventRepository();
const predictionRepo = new PredictionRepository();

import { AIService } from '../../services/ai/aiService';
import { ConfidenceEngine } from '../intelligence/confidenceEngine';

const aiService = new AIService();
const confidenceEngine = new ConfidenceEngine();

const signalAggregator = new SignalAggregator();
const predictionEngine = new PredictionEngine(aiService, predictionRepo, confidenceEngine);
const attributionEngine = new AttributionEngine(aiService);
const decisionContextBuilder = new DecisionContextBuilder();

const agentRegistry = new AgentRegistry();
// Note: In a real app we would register the agents here. 
// For tests they will be mocked or initialized separately if needed.
const agentRunner = new AgentRunner(agentRegistry);

const consensusEngine = new ConsensusEngine();
const conflictResolver = new ConflictResolver();
const decisionOrchestrator = new DecisionOrchestrator(consensusEngine, conflictResolver);

const intelligencePipeline = new IntelligencePipeline(
  signalAggregator,
  predictionEngine,
  attributionEngine,
  decisionContextBuilder,
  agentRunner,
  decisionOrchestrator
);

// 3. Simulation Dependencies
const scenarioGenerator = new ScenarioGenerator();
const impactAnalyzer = new ImpactAnalyzer();
const simulationEngine = new SimulationEngine(scenarioGenerator, impactAnalyzer);
const recoveryPlanGenerator = new RecoveryPlanGenerator();
const recoveryPlanSelector = new RecoveryPlanSelector();

const simulationService = new SimulationService(
  simulationEngine,
  recoveryPlanGenerator,
  recoveryPlanSelector
);

// 4. Intelligence Service
const intelligenceService = new IntelligenceService(
  intelligencePipeline,
  simulationService,
  projectRepo,
  riskEventRepo,
  predictionRepo
);

// 5. Controller
const intelligenceController = new IntelligenceController(intelligenceService);

const router = Router();

router.use(authenticateJWT);

router.post('/full', requireRole(['ADMIN', 'PM']), validate(runFullSchema), intelligenceController.runFull);
router.post('/prediction', requireRole(['ADMIN', 'PM']), validate(runPredictionSchema), intelligenceController.runPrediction);
router.post('/decision', requireRole(['ADMIN', 'PM']), validate(runDecisionSchema), intelligenceController.runDecision);

export default router;
