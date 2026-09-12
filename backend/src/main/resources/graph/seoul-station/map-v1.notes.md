# map-v1.json — source / confidence notes

`demoData: true` on the map already flags every number in this file as unverified.
This file tracks *which kind* of uncertainty applies to which part, per the
IMG-DIRECT / IMG-CALC / ASSUMPTION / ASSIGNED / UNVERIFIED tagging agreed on earlier.

## Scope

`SEOUL_KTX_OVERVIEW` (the KTX / Line 1 / Line 4 concourse diagram with the
80m / 75m calibration lines) and `SEOUL_AREX_EXPLODED` are modeled. Both map
images are now the real, uncropped station diagrams (bundled in
`frontend/src/assets/`) — an earlier cropped placeholder for
`seoul-ktx-overview.png` caused node positions to drift from the actual
artwork; that has been replaced.

Two map-transition points now exist:
- Exit 15 (`SEOUL-1F-N110` ↔ `SEOUL-AREX-N001`) — the original KTX-arrival ↔
  AREX-platform path.
- A second, direct transfer (`SEOUL-AREX-N007` ↔ `SEOUL-B1-N060`) added from
  the AREX diagram's own "Transfer to Line 1, Line 4" arrow: AREX platform →
  stairs (`SEOUL-AREX-N005`) → B3 all-stop ticket concourse
  (`SEOUL-AREX-N006`) → B2 express ticket concourse (`SEOUL-AREX-N007`) →
  straight into the existing B1 concourse junction. This is shorter than
  going back out through Exit 15, so STANDARD now prefers it for AREX↔Line1/4
  requests; LUGGAGE still can't use it (STAIR) and keeps the Exit-15 +
  elevator route.

The AREX coordinates, distances, and floor connections remain mock data
until field verification.

## Per-field basis

| Field | Basis | Tag |
|---|---|---|
| `floor` | Read directly from floor labels in the image | IMG-DIRECT |
| `nodeType` | Read from icon (elevator/escalator/gate/platform) | IMG-DIRECT |
| `imageX`, `imageY` | Visual estimate of position within the image, not pixel-measured | IMG-CALC |
| `distanceMeters` | Derived from the 75m/80m reference lines' proportion to other segments, by eye | IMG-CALC |
| `baseDurationSeconds` | `distance / 1.2 m/s` for WALK; flat ride-time guess for ELEVATOR/ESCALATOR (wait-time penalties are NOT included here — they belong in the profile cost policy) | ASSUMPTION |
| `description` | Written by paraphrasing visible labels/icons | ASSUMPTION |
| all `*_id` values | Assigned per the naming convention, not derived from any source | ASSIGNED |
| `facility.status` | Always `AVAILABLE` — no live data exists for this map | ASSUMPTION |
| `SEOUL-1F-N110` continuation into AREX | Exit 15 transition anchor inferred from both diagrams | UNVERIFIED |
| AREX node coordinates and edge geometry | Visually assigned from the exploded diagram | IMG-CALC |
| AREX edge distances and duration | Demo values without a reliable scale reference | ASSUMPTION |

## Open question before this is trustworthy for the demo

**The KTX-side hub (`SEOUL-1F-N030`) still has no STAIR edge** — every path
from there down to B1 goes through the elevator or escalator, both allowed
for STANDARD and LUGGAGE alike, so a plain `KTX arrival → Line 1/4` request
still returns the same route for both profiles. This was deliberately
deprioritized in favor of the AREX direct-transfer path above.

The AREX-side stair (`SEOUL-AREX-N005` → `SEOUL-AREX-N006`, `SEOUL-E021`) *is*
new and *does* make STANDARD and LUGGAGE diverge — but only for routes that
touch the AREX platform (e.g. `AREX Platform → Line 1/4 Platform`). If the
demo script only walks through `KTX arrival → Line 1/4`, it still won't show
a profile difference; use an AREX-involving pair instead, or add the KTX-side
stair later.

**The B7→B6→B3→B2 stair segment's distance/duration are rough guesses**
(demoData) built from the diagram's relative floor spacing, not a real
measurement — five underground levels is a lot to cross, so this number is
one of the least trustworthy in the file. Field-verify before treating
"88m / 106s" as real.
