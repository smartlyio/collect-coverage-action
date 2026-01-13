import type * as coverage from './coverage';

export interface ActionInputs {
  coverageFile: string;
  token: string;
  projectName: string;
  url: string;
  coverageFormat: string;
  dryRun: string;
  prNumber: number | undefined;
  repoName: string;
}

/**
 * Builds coverage.run options from action inputs, applying defaults for empty strings.
 * Uses || instead of ?? because core.getInput returns '' for unset inputs.
 */
export function buildRunOptions(inputs: ActionInputs): Parameters<typeof coverage.run>[0] {
  return {
    coverage: inputs.coverageFile,
    token: inputs.token,
    tag: inputs.prNumber != null ? `pr-${inputs.prNumber}` : 'main',
    project: inputs.projectName || inputs.repoName,
    url: inputs.url,
    coverageFormat: (inputs.coverageFormat || 'istanbul') as 'summary' | 'istanbul',
    dryRun: inputs.dryRun === 'true'
  };
}
