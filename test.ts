import * as cov from './src/coverage';

async function run() {
  await cov.run({
    dryRun: true,
    coverage: 'test/summary/a/coverage/coverage.json',
    token: 'token',
    project: 'project',
    tag: 'pr-124',
    url: 'https://example.com',
    coverageFormat: 'summary'
  });
  await cov.run({
    dryRun: true,
    coverage: 'test/jest/c/coverage/coverage.json',
    token: 'token',
    project: 'project',
    tag: 'pr-123',
    url: 'https://example.com',
    coverageFormat: 'istanbul'
  });
  await cov.run({
    dryRun: true,
    coverage: 'test/lcov-summary/coverage.json',
    token: 'token',
    project: 'project',
    tag: 'pr-123',
    url: 'https://example.com',
    coverageFormat: 'summary'
  });
}

void run();
