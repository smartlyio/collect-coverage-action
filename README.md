# Collect coverage action

Collect coverage percentages to a centralised repository.

## Usage

add following to your steps

```
    - name: annotate uncovered lines
      uses: smartlyio/collect-coverage-action
      with:
        coverage-file: coverage/coverage-final.json
        authorization-token: ${{ secrets.some-bearer-token-for-the-url }}
        url: https://example.com/stats
```

This will result in a request like

```
curl \
 -X POST \
 -d '{ "project": "repository/name", "tag": "main or pr-NNN", "value": 40.84, "flavor": "branches" }'  \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer some-bearer-token" \
 https://example.com/stats
```

the same action sends a request for 'branches', 'statements' and 'functions' coverage if it finds those from the
coverage json
