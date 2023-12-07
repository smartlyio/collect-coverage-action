# Collect coverage action

Collect packages specific coverage percentages to a centralised repository.

## Usage

add following to your steps after the step running your test suite

```
    - name: annotate uncovered lines
      uses: smartlyio/collect-coverage-action
      with:
        coverage-file: packages/*/coverage/coverage.json
        authorization-token: ${{ secrets.some-bearer-token-for-the-url }}
        url: https://example.com/stats
```

Where `packages/coverage/*/coverage.json` is a path to file or files produced by Jest. Multiple files are supported with wildcard syntax and matching. The action assumes the input file or files to be produced by Jest using the folowing option:

```
coverageReporters: ['json']
```

or with `coverage-format: summary` option:

```
coverageReporters: ['json-summary]
```
If you can produce a similar file without jest that is fine also.


With repo structure with the coverage files in 
`packages/pkg/coverage/coverage.json` and `packages/other/coverage/coverage.json` this will 
result in two requests with project being `repository/name/pkg` and `repository/name/other`. eg

```
curl \
 -X POST \
 -d '{ "project": "repository/name/pkg", "tag": "main or pr-NNN", "value": 40.84, "flavor": "branches" }'  \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer some-bearer-token" \
 https://example.com/stats
```

the same action sends a request for 'branches', 'statements' and 'functions' coverage if it finds those from the
coverage json

## Development

To test `yarn ts-node test.ts`
