# Project Scan Schema

Use `based-doctor` output or this schema as the first context layer for unfamiliar repositories.

```json
{
  "root": "",
  "timestamp": "",
  "instructions": [],
  "manifests": [],
  "packageManagers": [],
  "languages": [],
  "scripts": {},
  "validationCandidates": [],
  "testLocations": [],
  "riskNotes": [],
  "git": {
    "isRepository": false,
    "branch": "",
    "statusShort": []
  }
}
```

## Use

- Treat the scan as routing context, not proof.
- Open exact files before editing.
- Validate detected commands before assuming they are authoritative.
- Prefer repository scripts over generic commands when scripts exist.

