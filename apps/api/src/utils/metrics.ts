import { RequestContext } from './requestContext';
import { Logger } from './logger';

export interface IMetricsProvider {
  incrementCounter(name: string, value?: number, tags?: Record<string, string>): void;
  recordLatency(name: string, ms: number, tags?: Record<string, string>): void;
}

export class InMemoryMetricsProvider implements IMetricsProvider {
  // We keep a simple in-memory log of metrics for this abstraction
  // which just forwards to Logger for now to be observable.
  
  incrementCounter(name: string, value = 1, tags?: Record<string, string>): void {
    const context = RequestContext.get();
    Logger.info(`[Metric:Counter] ${name}`, {
      metric: true,
      type: 'counter',
      name,
      value,
      tags,
      requestId: context?.requestId,
    });
  }

  recordLatency(name: string, ms: number, tags?: Record<string, string>): void {
    const context = RequestContext.get();
    Logger.info(`[Metric:Latency] ${name}`, {
      metric: true,
      type: 'latency',
      name,
      valueMs: ms,
      tags,
      requestId: context?.requestId,
    });
  }
}

export const Metrics: IMetricsProvider = new InMemoryMetricsProvider();
