import { RequestContext } from '../requestContext';

describe('RequestContext', () => {
  it('should isolate context across different runs', async () => {
    const promises: Promise<void>[] = [];

    const runWithContext = async (id: string) => {
      return RequestContext.runAsync({ requestId: id }, async () => {
        // Yield to event loop to simulate async work and ensure isolation
        await new Promise(resolve => setTimeout(resolve, 10));
        const currentId = RequestContext.getRequestId();
        expect(currentId).toBe(id);
      });
    };

    promises.push(runWithContext('req-1'));
    promises.push(runWithContext('req-2'));
    promises.push(runWithContext('req-3'));

    await Promise.all(promises);
  });

  it('should return undefined when no context is active', () => {
    expect(RequestContext.getRequestId()).toBeUndefined();
  });
});
