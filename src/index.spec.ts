import { buildRunOptions, ActionInputs } from './buildRunOptions';

describe('buildRunOptions', () => {
  const baseInputs: ActionInputs = {
    coverageFile: 'coverage.json',
    token: 'test-token',
    projectName: '',
    url: 'https://example.com',
    coverageFormat: '',
    dryRun: 'false',
    prNumber: undefined,
    repoName: 'default-repo'
  };

  it('uses fallback project name when input is empty string', () => {
    const result = buildRunOptions({ ...baseInputs, projectName: '' });
    expect(result.project).toBe('default-repo');
  });

  it('uses provided project name when input is non-empty', () => {
    const result = buildRunOptions({ ...baseInputs, projectName: 'custom-project' });
    expect(result.project).toBe('custom-project');
  });

  it('uses fallback coverage format when input is empty string', () => {
    const result = buildRunOptions({ ...baseInputs, coverageFormat: '' });
    expect(result.coverageFormat).toBe('istanbul');
  });

  it('uses provided coverage format when input is non-empty', () => {
    const result = buildRunOptions({ ...baseInputs, coverageFormat: 'summary' });
    expect(result.coverageFormat).toBe('summary');
  });

  it('uses pr tag when prNumber is provided', () => {
    const result = buildRunOptions({ ...baseInputs, prNumber: 123 });
    expect(result.tag).toBe('pr-123');
  });

  it('uses main tag when prNumber is undefined', () => {
    const result = buildRunOptions({ ...baseInputs, prNumber: undefined });
    expect(result.tag).toBe('main');
  });

  it('sets dryRun true when input is "true"', () => {
    const result = buildRunOptions({ ...baseInputs, dryRun: 'true' });
    expect(result.dryRun).toBe(true);
  });

  it('sets dryRun false when input is not "true"', () => {
    const result = buildRunOptions({ ...baseInputs, dryRun: 'false' });
    expect(result.dryRun).toBe(false);
  });

  it('passes through coverage file and url unchanged', () => {
    const result = buildRunOptions(baseInputs);
    expect(result.coverage).toBe('coverage.json');
    expect(result.url).toBe('https://example.com');
  });
});
