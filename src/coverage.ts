import * as fs from 'fs';
import axios from 'axios';
import * as assert from 'assert';
import * as glob from 'glob';

type Opts = {
  coverage: string;
  token: string;
  project: string;
  tag: string;
  url: string;
  dryRun?: boolean;
};

function withSubPackage(pattern: string) {
  assert(!/\*.*\*/.test(pattern), `Only one * wildcard in the pattern is supported.`);
  const packageNameAt = pattern.split('/').indexOf('*');
  return (repo: string, path: string) => {
    if (packageNameAt < 0) {
      return repo;
    }
    const splitPath = path.split('/');
    return `${repo}/${splitPath[packageNameAt]}`;
  };
}

export async function run(opts: Opts) {
  const tagger = withSubPackage(opts.coverage);
  for (const file of glob.sync(opts.coverage)) {
    assert(/\.json$/.test(file), `Coverage file '${file}' should be (jest) json formatted`);
    await publishCoverage({ ...opts, coverage: file, project: tagger(opts.project, file) });
  }
}

async function publishCoverage(opts: Opts) {
  const coverage = JSON.parse(fs.readFileSync(opts.coverage, 'utf8'));
  for (const flavor of ['branches', 'statements', 'functions', 'lines']) {
    const pct = coverage.total[flavor]?.pct;
    const coveredItems = coverage.total[flavor]?.covered;
    const totalItems = coverage.total[flavor]?.total;

    if (pct != null) {
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
        await axios.post(opts.url, data, {
          headers: { Authorization: `Bearer ${opts.token}` }
        });
      }
    }
  }
}
