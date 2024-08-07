import * as coverage from './coverage';
import { fetch, Agent, MockAgent, MockPool, setGlobalDispatcher } from 'undici';

describe('coverage', () => {
  let mockClient: MockPool;
  let mockAgent: MockAgent;
  beforeEach(() => {
    // @ts-expect-error mock fetch with undici
    global.fetch = fetch;
    mockAgent = new MockAgent();
    mockClient = mockAgent.get('https://example.com'); //new MockClient('https://example.com', { agent: mockAgent });
    setGlobalDispatcher(mockAgent);
    mockAgent.disableNetConnect();
  });

  afterEach(async () => {
    await mockAgent.close();
    setGlobalDispatcher(new Agent());
  });

  describe('network error handling', () => {
    it('it eventually gives up on retries', async () => {
      mockClient
        .intercept({
          method: 'POST',
          path: '/',
          headers: {
            authorization: `Bearer token`
          }
        })
        .reply(503, {})
        .persist();
      await expect(
        coverage.run({
          coverage: 'test/summary/a/coverage/coverage.json',
          token: 'token',
          project: 'project',
          tag: 'pr-124',
          url: 'https://example.com',
          coverageFormat: 'summary'
        })
      ).rejects.toThrow();
      mockAgent.assertNoPendingInterceptors();
    });
    it('retries 4xx failures', async () => {
      let calls = 0;
      let failingCalls = 0;
      mockClient
        .intercept({
          method: 'POST',
          path: '/',
          headers: {
            authorization: `Bearer token`
          },
          body() {
            if (failingCalls < 1) {
              failingCalls++;
              return true;
            }
            return false;
          }
        })
        .reply(403, {})
        .persist();
      mockClient
        .intercept({
          method: 'POST',
          path: '/',
          headers: {
            authorization: `Bearer token`
          },
          body() {
            calls++;
            return true;
          }
        })
        .reply(200, {})
        .persist();
      await coverage.run({
        coverage: 'test/summary/a/coverage/coverage.json',
        token: 'token',
        project: 'project',
        tag: 'pr-124',
        url: 'https://example.com',
        coverageFormat: 'summary'
      });
      mockAgent.assertNoPendingInterceptors();
      expect(failingCalls).toEqual(1);
      expect(calls).toEqual(5);
    });
    it('retries 5xx failures', async () => {
      let calls = 0;
      let failingCalls = 0;
      mockClient
        .intercept({
          method: 'POST',
          path: '/',
          headers: {
            authorization: `Bearer token`
          },
          body() {
            if (failingCalls < 1) {
              failingCalls++;
              return true;
            }
            return false;
          }
        })
        .reply(503, {})
        .persist();
      mockClient
        .intercept({
          method: 'POST',
          path: '/',
          headers: {
            authorization: `Bearer token`
          },
          body() {
            calls++;
            return true;
          }
        })
        .reply(200, {})
        .persist();
      await coverage.run({
        coverage: 'test/summary/a/coverage/coverage.json',
        token: 'token',
        project: 'project',
        tag: 'pr-124',
        url: 'https://example.com',
        coverageFormat: 'summary'
      });
      mockAgent.assertNoPendingInterceptors();
      expect(failingCalls).toEqual(1);
      expect(calls).toEqual(5);
    });
  });
  it("generates coverage for 'summary' format", async () => {
    let calls = 0;
    mockClient
      .intercept({
        method: 'POST',
        path: '/',
        headers: {
          authorization: `Bearer token`
        },
        body(data) {
          calls += 1;
          expect(JSON.parse(data).tag).toEqual('pr-124');
          return true;
        }
      })
      .reply(200, {})
      .persist();
    await coverage.run({
      coverage: 'test/summary/a/coverage/coverage.json',
      token: 'token',
      project: 'project',
      tag: 'pr-124',
      url: 'https://example.com',
      coverageFormat: 'summary'
    });
    mockAgent.assertNoPendingInterceptors();
    expect(calls).toEqual(4);
  });

  it("generates coverage for 'istanbul' format", async () => {
    mockClient
      .intercept({
        method: 'POST',
        path: '/',
        headers: {
          authorization: `Bearer token`
        },
        body(data) {
          expect(JSON.parse(data).tag).toEqual('pr-123');
          return true;
        }
      })
      .reply(200, {})
      .persist();
    await coverage.run({
      coverage: 'test/jest/c/coverage/coverage.json',
      token: 'token',
      project: 'project',
      tag: 'pr-123',
      url: 'https://example.com',
      coverageFormat: 'istanbul'
    });
    mockAgent.assertNoPendingInterceptors();
  });

  it("generates coverage for 'lcov' format", async () => {
    const data: Record<string, number> = {};
    mockClient
      .intercept({
        method: 'POST',
        path: '/',
        headers: {
          authorization: `Bearer token`
        },
        body(json) {
          const payload = JSON.parse(json);
          data[payload.flavor] = payload.value;
          return true;
        }
      })
      .reply(200, {})
      .persist();
    await coverage.run({
      coverage: 'test/lcov.info',
      token: 'token',
      project: 'project',
      tag: 'pr-123',
      url: 'https://example.com',
      coverageFormat: 'lcov'
    });
    expect(data).toEqual({
      branches: 62.5,
      functions: 100,
      lines: 89.47368421052632
    });
    mockAgent.assertNoPendingInterceptors();
  });

  it("generates coverage for 'cobertura' format", async () => {
    const data: Record<string, number> = {};
    mockClient
      .intercept({
        method: 'POST',
        path: '/',
        headers: {
          authorization: `Bearer token`
        },
        body(json) {
          const payload = JSON.parse(json);
          data[payload.flavor] = payload.value;
          return true;
        }
      })
      .reply(200, {})
      .persist();
    await coverage.run({
      coverage: 'test/cobertura.xml',
      token: 'token',
      project: 'project',
      tag: 'pr-123',
      url: 'https://example.com',
      coverageFormat: 'cobertura'
    });
    expect(data).toEqual({
      branches: 73.91,
      lines: 93.44
    });
    mockAgent.assertNoPendingInterceptors();
  });

  it("only sends 'summary' coverage for existing fields", async () => {
    let calls = 0;
    mockClient
      .intercept({
        method: 'POST',
        path: '/',
        headers: {
          authorization: `Bearer token`
        },
        body(data) {
          calls += 1;
          expect(JSON.parse(data).tag).toEqual('pr-124');
          return true;
        }
      })
      .reply(200, {})
      .persist();
    await coverage.run({
      coverage: 'test/lcov-summary/coverage.json',
      token: 'token',
      project: 'project',
      tag: 'pr-124',
      url: 'https://example.com',
      coverageFormat: 'summary'
    });
    expect(calls).toEqual(2);
  });
});
