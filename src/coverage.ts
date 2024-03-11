import * as fs from 'fs/promises';
import * as assert from 'assert';
import { CoverageSummary, createCoverageMap, createCoverageSummary } from 'istanbul-lib-coverage';

type Opts = {
  coverage: string;
  token: string;
  project: string;
  tag: string;
  url: string;
  dryRun?: boolean;
  coverageFormat: 'summary' | 'istanbul';
};

async function generateSummary(file: string): Promise<CoverageSummary> {
  const map = createCoverageMap({});
  const summary = createCoverageSummary();
  map.merge(JSON.parse(await fs.readFile(file, { encoding: 'utf-8' })));
  map.files().forEach(file => {
    const fileCoverage = map.fileCoverageFor(file);
    const fileSummary = fileCoverage.toSummary();
    summary.merge(fileSummary);
  });

  return summary;
}

async function loadSummary(file: string): Promise<CoverageSummary> {
  const data = JSON.parse(await fs.readFile(file, { encoding: 'utf-8' }));
  assert(data.total, `Coverage file '${file}' is not a coverage summary file`);
  const summary = createCoverageSummary();
  summary.merge(data.total);
  return summary;
}

export async function run(opts: Opts) {
  const file = opts.coverage;
  assert(/\.json$/.test(file), `Coverage file '${file}' should be (jest) json formatted`);
  let summary: CoverageSummary;
  if (opts.coverageFormat === 'summary') {
    summary = await loadSummary(file);
  } else if (opts.coverageFormat === 'istanbul') {
    summary = await generateSummary(file);
  } else {
    throw new Error(`Unknown coverage format '${opts.coverageFormat}'`);
  }

  await publishCoverage({ ...opts, project: opts.project }, summary);
}

async function publishCoverage(opts: Omit<Opts, 'coverage'>, coverage: CoverageSummary) {
  for (const flavor of ['branches', 'statements', 'functions', 'lines'] as const) {
    const pct = coverage[flavor].pct;
    const coveredItems = coverage[flavor].covered;
    const totalItems = coverage[flavor].total;

    if (Number.isFinite(pct)) {
      if (opts.token) {
        const data = {
          project: opts.project,
          flavor: flavor,
          value: pct,
          tag: opts.tag,
          covered_items: coveredItems,
          total_items: totalItems
        };
        if (opts.dryRun) {
          // eslint-disable-next-line no-console
          console.log(data);
          continue;
        }
        const response = await fetch(opts.url, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { Authorization: `Bearer ${opts.token}`, 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Failed to publish coverage: ${response.status} ${response.statusText}`);
        }
      }
    }
  }
}
