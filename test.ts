import * as cov from './src/coverage';

async function run() {
  await cov.run({
    dryRun: true,
    coverage: 'test/packages/*/coverage/coverage.json',
    token: 'token',
    project: 'project',
    tag: 'pr-123',
    url: 'https://example.com'
  });
}

void run();
