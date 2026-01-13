import * as core from '@actions/core';
import * as github from '@actions/github';
import * as coverage from './coverage';
import { buildRunOptions, ActionInputs } from './buildRunOptions';

const tokenArgument = 'authorization-token';
const coverageFileArgument = 'coverage-file';
const urlArgument = 'url';
const projectNameArgument = 'project-name';

async function run() {
  const inputs: ActionInputs = {
    coverageFile: core.getInput(coverageFileArgument),
    token: core.getInput(tokenArgument),
    projectName: core.getInput(projectNameArgument),
    url: core.getInput(urlArgument),
    coverageFormat: core.getInput('coverage-format'),
    dryRun: core.getInput('dry-run'),
    prNumber: github.context.payload.pull_request?.number,
    repoName: github.context.repo.repo
  };
  await coverage.run(buildRunOptions(inputs));
}

void run();
