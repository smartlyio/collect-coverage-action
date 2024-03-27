# Collect coverage action

Collect packages specific coverage percentages to a centralised repository.

## Usage

add following to your steps after the step running your test suite

```
    - name: annotate uncovered lines
      uses: smartlyio/collect-coverage-action
      with:
        coverage-file: coverage/coverage.json
        authorization-token: ${{ secrets.some-bearer-token-for-the-url }}
        url: https://example.com/stats
```

Where `coverage/coverage.json` is a path to coverage file produced by Istanbul. The action assumes the input file or files to be produced by Jest using the following option:

```
coverageReporters: ['json']
```

or with `coverage-format: summary` option:

```
coverageReporters: ['json-summary]
```

If you can produce a similar file without Jest that is fine also.

This results in a request like this being made:

```
curl \
 -X POST \
 -d '{ "project": "owner/repository", "tag": "main or pr-NNN", "value": 40.84, "flavor": "branches" }'  \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer some-bearer-token" \
 https://example.com/stats
```

the same action sends a request for 'branches', 'statements' and 'functions' coverage if it finds those from the
coverage json

## Development

To test `yarn ts-node test.ts`
