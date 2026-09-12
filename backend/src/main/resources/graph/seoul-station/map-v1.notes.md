# map-v1.json — source / confidence notes

`demoData: true` on the map already flags every number in this file as unverified.
This file tracks *which kind* of uncertainty applies to which part, per the
IMG-DIRECT / IMG-CALC / ASSUMPTION / ASSIGNED / UNVERIFIED tagging agreed on earlier.

## Scope

Only `SEOUL_KTX_OVERVIEW` (the KTX / Line 1 / Line 4 concourse diagram with the
80m / 75m calibration lines) is modeled. The AREX exploded diagram is excluded —
no reliable scale reference could be drawn on it yet. `SEOUL-1F-N110` (Exit 15)
is a dead-end stub marking where the AREX map would attach later; it has no
outgoing edge.

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
| `SEOUL-1F-N110` continuation into AREX | Not modeled | UNVERIFIED |

## Open question before this is trustworthy for the demo

**No STAIR node/edge exists in this graph.** Every path from the 1F hub
(`SEOUL-1F-N030`) down to B1 goes through either the elevator
(`SEOUL-ELEVATOR-MAIN`) or the escalator (`SEOUL-ESCALATOR-MAIN`) — both of
which are allowed for both STANDARD and LUGGAGE under the current cost policy.
That means **STANDARD and LUGGAGE will currently compute the same route**,
which defeats the one visual differentiator the demo relies on.

This wasn't in the reviewed node table, so no stair node was added here. If a
staircase actually exists next to the main escalator (very likely in a real
station, but not confirmed from this image), add it and it should be blocked
for LUGGAGE only.
