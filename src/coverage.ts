import * as fs from 'fs';
import axios from 'axios';

type Opts = {
  coverage: string;
  token: string;
  project: string;
  tag: string;
  url: string;
};

export async function run(opts: Opts) {
  const coverage = JSON.parse(fs.readFileSync(opts.coverage, 'utf8'));
  for (const flavor of ['branches', 'statements', 'functions']) {
    const pct = coverage.total[flavor]?.pct;
    if (pct != null) {
      if (opts.token) {
        const data = { project: opts.project, flavor: flavor, value: pct, tag: opts.tag };
        await axios.post(opts.url, data, {
          headers: { Authorization: `Bearer ${opts.token}` }
        });
      }
    }
  }
}
