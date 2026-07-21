import { ReadonlyDecisionContext } from './agent.types';

export class DecisionContextBuilder {
  private project: Record<string, unknown> = {};
  private predictions: Record<string, unknown>[] = [];
  private attributions: Record<string, unknown>[] = [];
  private riskEvents: Record<string, unknown>[] = [];
  private publicSignals: Record<string, unknown>[] = [];

  setProject(project: Record<string, unknown>): this {
    this.project = { ...project };
    return this;
  }

  addPrediction(prediction: Record<string, unknown>): this {
    this.predictions.push({ ...prediction });
    return this;
  }

  addAttribution(attribution: Record<string, unknown>): this {
    this.attributions.push({ ...attribution });
    return this;
  }

  addRiskEvent(riskEvent: Record<string, unknown>): this {
    this.riskEvents.push({ ...riskEvent });
    return this;
  }

  addPublicSignal(signal: Record<string, unknown>): this {
    this.publicSignals.push({ ...signal });
    return this;
  }

  build(): ReadonlyDecisionContext {
    return Object.freeze({
      project: Object.freeze({ ...this.project }),
      predictions: Object.freeze([...this.predictions.map(p => Object.freeze(p))]),
      attributions: Object.freeze([...this.attributions.map(a => Object.freeze(a))]),
      riskEvents: Object.freeze([...this.riskEvents.map(r => Object.freeze(r))]),
      publicSignals: Object.freeze([...this.publicSignals.map(s => Object.freeze(s))]),
    });
  }
}
