import * as core from '@actions/core';
import * as github from '@actions/github';
import * as coverage from './coverage';
import * as assert from 'assert';

const tokenArgument = 'authorization-token';
const coverageFileArgument = 'coverage-file';
const urlArgument = 'url';

async function run() {
  const pr = github.context.payload.pull_request?.number;
  const coverageFile = core.getInput(coverageFileArgument);
  assert(/\.json$/.test(coverageFile), `Coverage file should be (jest) json formatted`);
  await coverage.run({
    coverage: coverageFile,
    token: core.getInput(tokenArgument),
    tag: pr != null ? `pr-${pr}` : 'main',
    project: github.context.repo.repo,
    url: core.getInput(urlArgument)
  });
}

void run();
