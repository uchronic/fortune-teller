# MLSS 1.5.0 web alignment — 2026-10-19

The public site remains at https://uchronic.github.io/fortune-teller/.

The browser now executes an allowlisted snapshot of the local MLSS Python modules
inside a self-hosted Pyodide Web Worker. The frozen lunar-python version is 1.4.8.
This preserves the local five-element coefficients, bone-weight tables, Meihua
logic, 41 Ziwei pattern functions, marriage knowledge and classical text excerpts.
The Qimen engine uses the local lunar-python sxtwl bridge; its only ephem usage
(date normalization) has a small compatible replacement, including month rollover.
Read-only solar-term and pillar functions are cached to avoid repeated ephemeris
work while constructing one chart.

## Included tools

- Gregorian/lunar input, leap lunar months, hours/minutes and an explicit midnight
  or late-zi day-boundary choice for Bazi.
- Bazi pillars, hidden stems, ten gods, growth stages, void branches, weighted
  five elements, actual start-of-luck date and age ranges.
- Ziwei twelve palaces, year mutagens, pattern conditions and spouse-palace notes.
- Bone-weight calculation, Meihua primary/mutual/changed hexagrams, Qimen chart.
- Almanac and auspicious hours, two-person chart comparison, classical text search.
- Coin hexagrams now include eight-palace classification, na-jia, six relations,
  six spirits and world/response positions.
- Local history retains calendar/minutes/convention and supports JSON export.
- The existing simplified Western astrology, tarot and numerology remain separate.

## Scope of parity

This snapshot shares the executable calculations and structured knowledge modules.
Hermes itself (its model conversation, private memories, case notes, NAS library,
credentialed external astrology account and tools) is not a static-web runtime.
No remote model or astrology-account keys are embedded in this release. Naming
and fengshui methods are reference notes rather than an imitation of an AI agent.
Relationship output describes the available traditional chart relations; it does
not claim to reproduce all of a model's open-ended interpretations.

## Validation

The shared 1990-02-14 12:00 male fixture returns 庚午 戊寅 庚戌 壬午,
weighted strength 偏弱 (0.1684), 6 years 6 months 20 days until luck begins,
and 己卯 age 7–16. Meihua and Qimen reference fixtures match the local engine.
Native tests cover calendar conversion, minute and zi-hour boundaries, invalid
dates, month/year rollover, almanac, classical search and chart comparison.
JavaScript checks exhaust all 64 eight-palace classifications and verify na-jia,
six-spirit order, and the year-stem mutagen regression.

The local Python Ziwei subprocess was also given explicit UTF-8 decoding, and
its Node CLI's year mutagen summary now reads the natal year stem rather than
the first palace's stem. The web adapter uses the same corrected rule.

## Public data boundary

Only executable modules and the bone-weight tables are synchronized. Private
profiles, memories, cases, credentials, network addresses and modern book TXT
collections are excluded. Embedded personal examples and module test entry
points are stripped from the public snapshot. Original algorithms remain intact.
See `engine/manifest.json` for source fingerprints and frozen dependencies.

## Deployment and rollback

`main` is the source branch. GitHub Actions installs dependencies, runs the
regression suite, builds the static app/runtime/archive, and deploys a Pages
artifact. The previous `gh-pages` commit is retained as a rollback reference:
`f39997a479b14b14df72e4731c0651a626f2039e`.

To roll back, change Pages to deploy the existing gh-pages branch, or restore a
prior source revision and let the validated workflow deploy it. No history is
force-pushed or deleted.

## Updating the snapshot

Run `scripts/sync_mlss.py --skill <local skill folder> --qimen <local engine folder>`
in the local environment containing the frozen dependencies. Review the public
diff and manifest, run `npm test` and `npm run build`, then push the source branch.
Never copy the entire Hermes profile into the repository.
