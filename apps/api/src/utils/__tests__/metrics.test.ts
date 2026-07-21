import { InMemoryMetricsProvider } from '../metrics';
import { Logger } from '../logger';

jest.mock('../logger');

describe('Metrics', () => {
  it('should format counters correctly and log them', () => {
    const metrics = new InMemoryMetricsProvider();
    metrics.incrementCounter('test_counter', 1, { tag: 'foo' });

    expect(Logger.info).toHaveBeenCalledWith(
      '[Metric:Counter] test_counter',
      expect.objectContaining({
        metric: true,
        type: 'counter',
        name: 'test_counter',
        value: 1,
        tags: { tag: 'foo' }
      })
    );
  });

  it('should format latency correctly and log them', () => {
    const metrics = new InMemoryMetricsProvider();
    metrics.recordLatency('test_latency', 150, { tag: 'bar' });

    expect(Logger.info).toHaveBeenCalledWith(
      '[Metric:Latency] test_latency',
      expect.objectContaining({
        metric: true,
        type: 'latency',
        name: 'test_latency',
        valueMs: 150,
        tags: { tag: 'bar' }
      })
    );
  });
});
